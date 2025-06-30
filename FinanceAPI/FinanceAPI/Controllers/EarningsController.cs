using Microsoft.AspNetCore.Mvc;
using FinanceAPI.Models;
using FinanceAPI.DTOs;
using FinanceAPI.Data;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class EarningsController : ControllerBase
{
    private readonly FinanceDbContext _context;
    public EarningsController(FinanceDbContext context) => _context = context;

    private static readonly string[] FrequencyOptions = new[] { "Daily", "Weekly", "Bi-Weekly", "Semi Monthly", "Quarterly", "Yearly" };

    [HttpGet]
    public ActionResult<IEnumerable<EarningDto>> GetEarnings()
    {
        var earnings = _context.Earnings
            .Include(e => e.Owner)
            .Include(e => e.SenderNavigation)
            .Include(e => e.ReceiverNavigation)
            .ToList()
            .Select(e => new EarningDto
            {
                Id = e.Id,
                Type = e.Type?.Trim(),
                Frequency = e.Frequency?.Trim(),
                StartDate = e.StartDate?.ToString("yyyy-MM-dd"),
                Sender = e.Sender,
                Receiver = e.Receiver,
                Item = e.Item?.Trim(),
                Amount = e.Amount,
                Currency = e.Currency?.Trim(),
                EndDate = e.EndDate?.ToString("yyyy-MM-dd"),
                OwnerId = e.OwnerId,
                LastUpdatedDate = e.LastUpdatedDate?.ToString("yyyy-MM-dd"),
                Description = e.Description?.Trim(),
                OwnerName = e.Owner != null ? (e.Owner.FirstName + " " + e.Owner.LastName).Trim() : null,
                SenderName = e.SenderNavigation != null ? (e.SenderNavigation.FirstName + " " + e.SenderNavigation.LastName).Trim() : null,
                ReceiverName = e.ReceiverNavigation != null ? (e.ReceiverNavigation.FirstName + " " + e.ReceiverNavigation.LastName).Trim() : null
            }).ToList();
        return earnings;
    }

    [HttpGet("{id}")]
    public ActionResult<EarningDto> GetEarning(int id)
    {
        var e = _context.Earnings
            .Include(e => e.Owner)
            .Include(e => e.SenderNavigation)
            .Include(e => e.ReceiverNavigation)
            .FirstOrDefault(e => e.Id == id);
        if (e == null) return NotFound();
        return new EarningDto
        {
            Id = e.Id,
            Type = e.Type?.Trim(),
            Frequency = e.Frequency?.Trim(),
            StartDate = e.StartDate?.ToString("yyyy-MM-dd"),
            Sender = e.Sender,
            Receiver = e.Receiver,
            Item = e.Item?.Trim(),
            Amount = e.Amount,
            Currency = e.Currency?.Trim(),
            EndDate = e.EndDate?.ToString("yyyy-MM-dd"),
            OwnerId = e.OwnerId,
            LastUpdatedDate = e.LastUpdatedDate?.ToString("yyyy-MM-dd"),
            Description = e.Description?.Trim(),
            OwnerName = e.Owner != null ? (e.Owner.FirstName + " " + e.Owner.LastName).Trim() : null,
            SenderName = e.SenderNavigation != null ? (e.SenderNavigation.FirstName + " " + e.SenderNavigation.LastName).Trim() : null,
            ReceiverName = e.ReceiverNavigation != null ? (e.ReceiverNavigation.FirstName + " " + e.ReceiverNavigation.LastName).Trim() : null
        };
    }

    [HttpPost]
    public ActionResult<EarningDto> PostEarning(EarningDto dto)
    {
        var earning = new Earning
        {
            Type = dto.Type?.Trim(),
            Frequency = dto.Frequency?.Trim(),
            StartDate = !string.IsNullOrEmpty(dto.StartDate) ? DateTime.Parse(dto.StartDate) : null,
            Sender = dto.Sender,
            Receiver = dto.Receiver,
            Item = dto.Item?.Trim(),
            Amount = dto.Amount,
            Currency = dto.Currency?.Trim(),
            EndDate = !string.IsNullOrEmpty(dto.EndDate) ? DateTime.Parse(dto.EndDate) : null,
            OwnerId = dto.OwnerId,
            LastUpdatedDate = !string.IsNullOrEmpty(dto.LastUpdatedDate) ? DateTime.Parse(dto.LastUpdatedDate) : null,
            Description = dto.Description?.Trim()
        };
        _context.Earnings.Add(earning);
        _context.SaveChanges();
        dto.Id = earning.Id;
        return CreatedAtAction(nameof(GetEarning), new { id = earning.Id }, dto);
    }

    [HttpPut("{id}")]
    public IActionResult PutEarning(int id, EarningDto dto)
    {
        var earning = _context.Earnings.Find(id);
        if (earning == null) return NotFound();
        earning.Type = dto.Type?.Trim();
        earning.Frequency = dto.Frequency?.Trim();
        earning.StartDate = !string.IsNullOrEmpty(dto.StartDate) ? DateTime.Parse(dto.StartDate) : null;
        earning.Sender = dto.Sender;
        earning.Receiver = dto.Receiver;
        earning.Item = dto.Item?.Trim();
        earning.Amount = dto.Amount;
        earning.Currency = dto.Currency?.Trim();
        earning.EndDate = !string.IsNullOrEmpty(dto.EndDate) ? DateTime.Parse(dto.EndDate) : null;
        earning.OwnerId = dto.OwnerId;
        earning.LastUpdatedDate = !string.IsNullOrEmpty(dto.LastUpdatedDate) ? DateTime.Parse(dto.LastUpdatedDate) : null;
        earning.Description = dto.Description?.Trim();
        _context.SaveChanges();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteEarning(int id)
    {
        var earning = _context.Earnings.Find(id);
        if (earning == null) return NotFound();
        _context.Earnings.Remove(earning);
        _context.SaveChanges();
        return NoContent();
    }

    [HttpGet("frequency-options")]
    public ActionResult<IEnumerable<string>> GetFrequencyOptions()
    {
        return FrequencyOptions;
    }

    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var result = await (from e in _context.Earnings
                            join owner in _context.Users on e.OwnerId equals owner.Id into ownerJoin
                            from ownerUser in ownerJoin.DefaultIfEmpty()
                            join sender in _context.Users on e.Sender equals sender.Id into senderJoin
                            from senderUser in senderJoin.DefaultIfEmpty()
                            join receiver in _context.Users on e.Receiver equals receiver.Id into receiverJoin
                            from receiverUser in receiverJoin.DefaultIfEmpty()
                            select new
                            {
                                e.Id,
                                e.OwnerId,
                                e.Sender,
                                e.Receiver,
                                e.Item,
                                e.Amount,
                                e.Currency,
                                e.Type,
                                e.Frequency,
                                e.Description,
                                OwnerShortName = ownerUser != null ? ownerUser.ShortName : string.Empty,
                                SenderShortName = senderUser != null ? senderUser.ShortName : string.Empty,
                                ReceiverShortName = receiverUser != null ? receiverUser.ShortName : string.Empty
                            }).ToListAsync();
        return result;
    }
}
