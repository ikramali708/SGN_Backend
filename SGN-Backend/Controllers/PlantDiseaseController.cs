using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN_Backend.DTOs;
using SGN_Backend.Services;

namespace SGN_Backend.Controllers;

[Route("api/plant-disease")]
[ApiController]
[Authorize(Roles = "Customer")]
[ApiExplorerSettings(GroupName = "CUSTOMER")]
[Tags("Customer plant disease")]
public class PlantDiseaseController : ControllerBase
{
    private const string MlHttpClientName = "PlantDiseaseMl";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<PlantDiseaseController> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public PlantDiseaseController(
        IHttpClientFactory httpClientFactory,
        ILogger<PlantDiseaseController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    /// <summary>
    /// Upload a leaf image for disease detection (proxied to the ML service).
    /// </summary>
    [HttpPost("detect")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [ProducesResponseType(typeof(PlantDiseaseDetectResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<IActionResult> Detect(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "An image file is required (form field: file)." });

        using var content = new MultipartFormDataContent();
        await using var stream = file.OpenReadStream();
        var streamContent = new StreamContent(stream);
        var contentType = string.IsNullOrWhiteSpace(file.ContentType)
            ? "application/octet-stream"
            : file.ContentType;
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        content.Add(streamContent, "file", file.FileName);

        var client = _httpClientFactory.CreateClient(MlHttpClientName);
        HttpResponseMessage response;
        try
        {
            response = await client.PostAsync("predict", content, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reach ML plant disease service.");
            return StatusCode(StatusCodes.Status502BadGateway,
                new { message = "Could not reach the plant disease detection service. Ensure the ML API is running." });
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("ML service returned {Status}: {Body}", (int)response.StatusCode, body);
            return StatusCode(StatusCodes.Status502BadGateway,
                new { message = "Plant disease detection service returned an error.", detail = body });
        }

        MlPredictResponseDto? ml;
        try
        {
            ml = JsonSerializer.Deserialize<MlPredictResponseDto>(body, JsonOptions);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Invalid JSON from ML service: {Body}", body);
            return StatusCode(StatusCodes.Status502BadGateway,
                new { message = "Invalid response from plant disease detection service." });
        }

        if (ml is null || string.IsNullOrWhiteSpace(ml.DiseaseName))
        {
            return StatusCode(StatusCodes.Status502BadGateway,
                new { message = "Plant disease detection service returned an empty prediction." });
        }

        var (treatment, prevention) = PlantDiseaseRecommendations.Get(ml.DiseaseName);

        return Ok(new PlantDiseaseDetectResponseDto
        {
            DiseaseName = ml.DiseaseName,
            Confidence = ml.Confidence,
            ClassId = ml.ClassId,
            Treatment = treatment,
            Prevention = prevention,
        });
    }
}
