using System.Text.Json.Serialization;

namespace SGN_Backend.DTOs;

/// <summary>JSON shape returned by the FastAPI /predict endpoint.</summary>
public class MlPredictResponseDto
{
    [JsonPropertyName("disease_name")]
    public string DiseaseName { get; set; } = "";

    [JsonPropertyName("class_id")]
    public int ClassId { get; set; }

    [JsonPropertyName("confidence")]
    public double Confidence { get; set; }
}

/// <summary>API response for plant disease detection including agronomic guidance.</summary>
public class PlantDiseaseDetectResponseDto
{
    [JsonPropertyName("disease_name")]
    public string DiseaseName { get; set; } = "";

    [JsonPropertyName("confidence")]
    public double Confidence { get; set; }

    [JsonPropertyName("class_id")]
    public int ClassId { get; set; }

    [JsonPropertyName("treatment")]
    public string Treatment { get; set; } = "";

    [JsonPropertyName("prevention")]
    public string Prevention { get; set; } = "";
}
