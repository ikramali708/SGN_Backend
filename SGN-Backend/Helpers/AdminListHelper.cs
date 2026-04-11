using SGN_Backend.DTOs;

namespace SGN_Backend.Helpers;

internal static class AdminListHelper
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;

    public static (int Page, int PageSize) NormalizePage(int? page, int? pageSize)
    {
        var p = page is null or < 1 ? 1 : page.Value;
        var ps = pageSize is null or < 1 ? DefaultPageSize : Math.Min(pageSize.Value, MaxPageSize);
        return (p, ps);
    }

    public static PagedResultDto<T> ToPagedResult<T>(IReadOnlyList<T> items, int page, int pageSize, int totalCount) =>
        new()
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            Items = items
        };
}
