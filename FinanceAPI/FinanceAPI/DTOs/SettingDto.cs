namespace FinanceAPI.DTOs;

public class SettingDto
{
    public int Id { get; set; }
    public string Key { get; set; } = null!;
    public string? Value { get; set; }
    public string? Units { get; set; }
    public string? Notes { get; set; }
}
