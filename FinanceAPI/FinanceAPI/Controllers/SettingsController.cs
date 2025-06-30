using Microsoft.AspNetCore.Mvc;
using FinanceAPI.Models;
using FinanceAPI.DTOs;
using FinanceAPI.Data;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly FinanceDbContext _context;
    public SettingsController(FinanceDbContext context) => _context = context;

    [HttpGet]
    public ActionResult<IEnumerable<SettingDto>> GetSettings()
    {
        return _context.Settings.ToList().Select(s => new SettingDto
        {
            Id = s.Id,
            Key = s.KeyName.Trim(),
            Value = s.Value.Trim(),
            Units = s.Units?.Trim(),
            Notes = s.Notes?.Trim()
        }).ToList();
    }

    [HttpGet("{id}")]
    public ActionResult<SettingDto> GetSetting(int id)
    {
        var s = _context.Settings.Find(id);
        if (s == null) return NotFound();
        return new SettingDto
        {
            Id = s.Id,
            Key = s.KeyName.Trim(),
            Value = s.Value.Trim(),
            Units = s.Units?.Trim(),
            Notes = s.Notes?.Trim()
        };
    }

    [HttpPost]
    public ActionResult<SettingDto> PostSetting(SettingDto dto)
    {
        var setting = new Setting
        {
            KeyName = dto.Key.Trim(),
            Value = dto.Value != null ? dto.Value.Trim() : string.Empty,
            Units = dto.Units?.Trim(),
            Notes = dto.Notes?.Trim()
        };
        _context.Settings.Add(setting);
        _context.SaveChanges();
        dto.Id = setting.Id;
        return CreatedAtAction(nameof(GetSetting), new { id = setting.Id }, dto);
    }

    [HttpPut("{id}")]
    public IActionResult PutSetting(int id, SettingDto dto)
    {
        var setting = _context.Settings.Find(id);
        if (setting == null) return NotFound();
        setting.KeyName = dto.Key.Trim();
        setting.Value = dto.Value != null ? dto.Value.Trim() : string.Empty;
        setting.Units = dto.Units?.Trim();
        setting.Notes = dto.Notes?.Trim();
        _context.SaveChanges();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteSetting(int id)
    {
        var setting = _context.Settings.Find(id);
        if (setting == null) return NotFound();
        _context.Settings.Remove(setting);
        _context.SaveChanges();
        return NoContent();
    }
}
