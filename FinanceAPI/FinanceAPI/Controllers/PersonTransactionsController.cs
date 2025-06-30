using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceAPI.Models;
using System.Linq;
using System.Threading.Tasks;
using FinanceAPI.DTOs;
using FinanceAPI.Data;

[ApiController]
    [Route("api/[controller]")]
    public class PersonTransactionsController : ControllerBase
    {
        private readonly FinanceDbContext _context;
        public PersonTransactionsController(FinanceDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var result = await (from pt in _context.PersonTransactions
                                join src in _context.Users on pt.SourceUserId equals src.Id into srcJoin
                                from srcUser in srcJoin.DefaultIfEmpty()
                                join dst in _context.Users on pt.DestinationUserId equals dst.Id into dstJoin
                                from dstUser in dstJoin.DefaultIfEmpty()
                                select new
                                {
                                    pt.Id,
                                    pt.SourceUserId,
                                    pt.DestinationUserId,
                                    pt.StartDate,
                                    pt.Currency,
                                    pt.Amount,
                                    pt.Purpose,
                                    pt.ScheduledEndDate,
                                    pt.ActualEndDate,
                                    pt.Status,
                                    pt.Reason,
                                    SourceShortName = srcUser != null ? srcUser.ShortName : string.Empty,
                                    DestinationShortName = dstUser != null ? dstUser.ShortName : string.Empty
                                }).ToListAsync();
            return result;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PersonTransactionDto>> Get(long id)
        {
            var x = await _context.PersonTransactions.FindAsync(id);
            if (x == null) return NotFound();
            return new PersonTransactionDto
            {
                Id = x.Id,
                SourceUserId = x.SourceUserId,
                DestinationUserId = x.DestinationUserId,
                StartDate = x.StartDate,
                Currency = x.Currency.Trim(),
                Amount = x.Amount,
                Purpose = x.Purpose != null ? x.Purpose.Trim() : null,
                ScheduledEndDate = x.ScheduledEndDate,
                ActualEndDate = x.ActualEndDate,
                Status = x.Status != null ? x.Status.Trim() : null,
                Reason = x.Reason != null ? x.Reason.Trim() : null
            };
        }

        [HttpPost]
        public async Task<ActionResult<PersonTransactionDto>> Post(PersonTransactionDto dto)
        {
            // Debug: Log incoming Id value
            Console.WriteLine($"[PersonTransactionsController] Incoming dto.Id: {dto.Id}");
            // Ensure Id is not set for new entity (avoid identity insert error)
            dto.Id = 0;

            // Validate required fields
            if (dto.SourceUserId == 0 && string.IsNullOrWhiteSpace(dto.SourceShortName))
                return BadRequest("SourceUserId or SourceShortName is required.");
            if (dto.DestinationUserId == 0 && string.IsNullOrWhiteSpace(dto.DestinationShortName))
                return BadRequest("DestinationUserId or DestinationShortName is required.");
            if (string.IsNullOrWhiteSpace(dto.Currency))
                return BadRequest("Currency is required.");
            if (dto.Amount == 0)
                return BadRequest("Amount must be non-zero.");

            // Try to resolve user IDs from short names if IDs are not provided
            if (dto.SourceUserId == 0 && !string.IsNullOrWhiteSpace(dto.SourceShortName))
            {
                var srcUser = await _context.Users.FirstOrDefaultAsync(u => u.ShortName == dto.SourceShortName);
                if (srcUser == null)
                    return BadRequest($"Source user with short name '{dto.SourceShortName}' not found.");
                dto.SourceUserId = srcUser.Id;
            }
            if (dto.DestinationUserId == 0 && !string.IsNullOrWhiteSpace(dto.DestinationShortName))
            {
                var dstUser = await _context.Users.FirstOrDefaultAsync(u => u.ShortName == dto.DestinationShortName);
                if (dstUser == null)
                    return BadRequest($"Destination user with short name '{dto.DestinationShortName}' not found.");
                dto.DestinationUserId = dstUser.Id;
            }

            // Validate user IDs
            var sourceExists = await _context.Users.AnyAsync(u => u.Id == dto.SourceUserId);
            var destExists = await _context.Users.AnyAsync(u => u.Id == dto.DestinationUserId);
            if (!sourceExists || !destExists)
            {
                return BadRequest($"Invalid SourceUserId or DestinationUserId. Both must exist in Users table. SourceUserId: {dto.SourceUserId}, DestinationUserId: {dto.DestinationUserId}");
            }
            var entity = new PersonTransaction
            {
                SourceUserId = dto.SourceUserId,
                DestinationUserId = dto.DestinationUserId,
                StartDate = dto.StartDate,
                Currency = dto.Currency != null ? dto.Currency.Trim() : string.Empty,
                Amount = dto.Amount,
                Purpose = dto.Purpose?.Trim(),
                ScheduledEndDate = dto.ScheduledEndDate,
                ActualEndDate = dto.ActualEndDate,
                Status = dto.Status?.Trim(),
                Reason = dto.Reason?.Trim()
            };
            _context.PersonTransactions.Add(entity);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Log and return error
                Console.WriteLine($"[PersonTransactionsController] DbUpdateException: {ex.Message}");
                return StatusCode(500, $"Failed to add record: {ex.Message}");
            }
            dto.Id = entity.Id;
            return CreatedAtAction(nameof(Get), new { id = entity.Id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(long id, PersonTransactionDto dto)
        {
            var entity = await _context.PersonTransactions.FindAsync(id);
            if (entity == null) return NotFound();
            entity.SourceUserId = dto.SourceUserId;
            entity.DestinationUserId = dto.DestinationUserId;
            entity.StartDate = dto.StartDate;
            entity.Currency = dto.Currency != null ? dto.Currency.Trim() : string.Empty;
            entity.Amount = dto.Amount;
            entity.Purpose = dto.Purpose?.Trim();
            entity.ScheduledEndDate = dto.ScheduledEndDate;
            entity.ActualEndDate = dto.ActualEndDate;
            entity.Status = dto.Status?.Trim();
            entity.Reason = dto.Reason?.Trim();
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var entity = await _context.PersonTransactions.FindAsync(id);
            if (entity == null) return NotFound();
            _context.PersonTransactions.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("summary")]
        public async Task<ActionResult<IEnumerable<object>>> GetSummary()
        {
            var users = await _context.Users.AsNoTracking().ToListAsync();
            var transactions = await _context.PersonTransactions.AsNoTracking().ToListAsync();

            // Group by (Source, Destination, Currency)
            var grouped = transactions
                .GroupBy(t => new { t.SourceUserId, t.DestinationUserId, t.Currency })
                .Select(g => new
                {
                    SourceUserId = g.Key.SourceUserId,
                    DestinationUserId = g.Key.DestinationUserId,
                    Currency = g.Key.Currency,
                    TotalAmount = g.Sum(x => x.Amount),
                    Details = g.Select(x => new {
                        x.Id, // Include transaction Id
                        x.Purpose,
                        x.Amount,
                        ScheduleDate = x.StartDate,
                        x.Status
                    }).ToList()
                })
                .ToList();

            // Merge reverse pairs and net the amounts
            var merged = new List<dynamic>();
            var visited = new HashSet<string>();
            foreach (var item in grouped)
            {
                var key = $"{item.SourceUserId}-{item.DestinationUserId}-{item.Currency}";
                var reverseKey = $"{item.DestinationUserId}-{item.SourceUserId}-{item.Currency}";
                if (visited.Contains(key) || visited.Contains(reverseKey)) continue;

                var reverse = grouped.FirstOrDefault(g => g.SourceUserId == item.DestinationUserId && g.DestinationUserId == item.SourceUserId && g.Currency == item.Currency);
                decimal netAmount = item.TotalAmount;
                List<dynamic> details = new List<dynamic>(item.Details);
                if (reverse != null)
                {
                    netAmount -= reverse.TotalAmount;
                    details.AddRange(reverse.Details.Select(d => new {
                        d.Purpose,
                        Amount = -d.Amount,
                        d.ScheduleDate,
                        d.Status
                    }));
                    visited.Add(reverseKey);
                }
                visited.Add(key);
                if (netAmount != 0)
                {
                    merged.Add(new {
                        SourceUserId = item.SourceUserId,
                        DestinationUserId = item.DestinationUserId,
                        Currency = item.Currency,
                        NetAmount = netAmount,
                        Details = details,
                        SourceShortName = users.FirstOrDefault(u => u.Id == item.SourceUserId)?.ShortName ?? item.SourceUserId.ToString(),
                        DestinationShortName = users.FirstOrDefault(u => u.Id == item.DestinationUserId)?.ShortName ?? item.DestinationUserId.ToString()
                    });
                }
            }
            return Ok(merged);
        }

        [HttpGet("summary/{sourceUserId}/{destinationUserId}/{currency}")]
        public async Task<ActionResult<object>> GetSummaryByKey(long sourceUserId, long destinationUserId, string currency)
        {
            var users = await _context.Users.AsNoTracking().ToListAsync();
            var transactions = await _context.PersonTransactions.AsNoTracking()
                .Where(t => (t.SourceUserId == sourceUserId && t.DestinationUserId == destinationUserId && t.Currency == currency) ||
                            (t.SourceUserId == destinationUserId && t.DestinationUserId == sourceUserId && t.Currency == currency))
                .ToListAsync();
            if (!transactions.Any()) return NotFound();
            var totalAtoB = transactions.Where(t => t.SourceUserId == sourceUserId && t.DestinationUserId == destinationUserId).Sum(t => t.Amount);
            var totalBtoA = transactions.Where(t => t.SourceUserId == destinationUserId && t.DestinationUserId == sourceUserId).Sum(t => t.Amount);
            var netAmount = totalAtoB - totalBtoA;
            var details = transactions.Select(t => new {
                t.Id, // Include transaction Id
                t.Purpose,
                Amount = t.SourceUserId == sourceUserId ? t.Amount : -t.Amount,
                ScheduleDate = t.StartDate,
                t.Status
            }).ToList();
            return Ok(new {
                SourceUserId = sourceUserId,
                DestinationUserId = destinationUserId,
                Currency = currency,
                NetAmount = netAmount,
                Details = details,
                SourceShortName = users.FirstOrDefault(u => u.Id == sourceUserId)?.ShortName ?? sourceUserId.ToString(),
                DestinationShortName = users.FirstOrDefault(u => u.Id == destinationUserId)?.ShortName ?? destinationUserId.ToString()
            });
        }

        [HttpPut("summary/{sourceUserId}/{destinationUserId}/{currency}")]
        public async Task<IActionResult> UpdateSummary(long sourceUserId, long destinationUserId, string currency, [FromBody] List<PersonTransactionDto> updatedDetails)
        {
            // Remove all existing transactions for this group
            var transactions = await _context.PersonTransactions
                .Where(t => (t.SourceUserId == sourceUserId && t.DestinationUserId == destinationUserId && t.Currency == currency) ||
                            (t.SourceUserId == destinationUserId && t.DestinationUserId == sourceUserId && t.Currency == currency))
                .ToListAsync();
            _context.PersonTransactions.RemoveRange(transactions);
            // Add new ones from updatedDetails
            foreach (var dto in updatedDetails)
            {
                // Validate user IDs
                var sourceExists = await _context.Users.AnyAsync(u => u.Id == dto.SourceUserId);
                var destExists = await _context.Users.AnyAsync(u => u.Id == dto.DestinationUserId);
                if (!sourceExists || !destExists)
                {
                    return BadRequest($"Invalid SourceUserId or DestinationUserId in details. Both must exist in Users table. SourceUserId: {dto.SourceUserId}, DestinationUserId: {dto.DestinationUserId}");
                }
                var entity = new PersonTransaction
                {
                    SourceUserId = dto.SourceUserId,
                    DestinationUserId = dto.DestinationUserId,
                    StartDate = dto.StartDate,
                    Currency = dto.Currency != null ? dto.Currency.Trim() : string.Empty,
                    Amount = dto.Amount,
                    Purpose = dto.Purpose?.Trim(),
                    ScheduledEndDate = dto.ScheduledEndDate,
                    ActualEndDate = dto.ActualEndDate,
                    Status = dto.Status?.Trim(),
                    Reason = dto.Reason?.Trim()
                };
                _context.PersonTransactions.Add(entity);
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("summary/{sourceUserId}/{destinationUserId}/{currency}")]
        public async Task<IActionResult> DeleteSummary(long sourceUserId, long destinationUserId, string currency)
        {
            var transactions = await _context.PersonTransactions
                .Where(t => (t.SourceUserId == sourceUserId && t.DestinationUserId == destinationUserId && t.Currency == currency) ||
                            (t.SourceUserId == destinationUserId && t.DestinationUserId == sourceUserId && t.Currency == currency))
                .ToListAsync();
            if (!transactions.Any()) return NotFound();
            _context.PersonTransactions.RemoveRange(transactions);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

