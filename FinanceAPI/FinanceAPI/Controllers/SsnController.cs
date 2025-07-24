using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceAPI.Models;
using FinanceAPI.Data;
using FinanceAPI.DTOs;

namespace FinanceAPI.Controllers
{
    [ApiController]
    [Route("api/investment/ssn")]
    public class SsnController : ControllerBase
    {
        private readonly FinanceDbContext _context;
        public SsnController(FinanceDbContext context) => _context = context;

        // GET: api/investment/ssn
        [HttpGet]
        public async Task<IActionResult> GetSsns()
        {
            var ssns = await _context.SSNs
                .Include(s => s.User)
                .ToListAsync();
                
            var result = ssns.Select(s => new SSNDto {
                Id = s.Id,
                UserId = s.UserId,
                UserShortName = s.User?.ShortName?.Trim(),
                Currency = s.Currency?.Trim(),
                MonthlyAfter62 = s.MonthlyAfter62,
                MonthlyAfter67 = s.MonthlyAfter67,
                MonthlyAfter70 = s.MonthlyAfter70,
                LastUpdatedDate = s.LastUpdatedDate,
                Description = s.Description?.Trim()
            }).ToList();
            
            return Ok(result);
        }

        // GET: api/investment/ssn/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSsn(int id)
        {
            var ssn = await _context.SSNs
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (ssn == null)
                return NotFound();

            var result = new SSNDto {
                Id = ssn.Id,
                UserId = ssn.UserId,
                UserShortName = ssn.User?.ShortName?.Trim(),
                Currency = ssn.Currency?.Trim(),
                MonthlyAfter62 = ssn.MonthlyAfter62,
                MonthlyAfter67 = ssn.MonthlyAfter67,
                MonthlyAfter70 = ssn.MonthlyAfter70,
                LastUpdatedDate = ssn.LastUpdatedDate,
                Description = ssn.Description?.Trim()
            };
            
            return Ok(result);
        }

        // POST: api/investment/ssn
        [HttpPost]
        public async Task<IActionResult> CreateSsn([FromBody] SSNDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ssn = new SSN {
                UserId = dto.UserId,
                Currency = dto.Currency?.Trim(),
                MonthlyAfter62 = dto.MonthlyAfter62,
                MonthlyAfter67 = dto.MonthlyAfter67,
                MonthlyAfter70 = dto.MonthlyAfter70,
                LastUpdatedDate = dto.LastUpdatedDate,
                Description = dto.Description?.Trim()
            };

            _context.SSNs.Add(ssn);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSsn), new { id = ssn.Id }, dto);
        }

        // PUT: api/investment/ssn/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSsn(int id, [FromBody] SSNDto dto)
        {
            if (id != dto.Id)
                return BadRequest("ID mismatch");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ssn = await _context.SSNs.FindAsync(id);
            if (ssn == null)
                return NotFound();

            ssn.UserId = dto.UserId;
            ssn.Currency = dto.Currency?.Trim();
            ssn.MonthlyAfter62 = dto.MonthlyAfter62;
            ssn.MonthlyAfter67 = dto.MonthlyAfter67;
            ssn.MonthlyAfter70 = dto.MonthlyAfter70;
            ssn.LastUpdatedDate = dto.LastUpdatedDate;
            ssn.Description = dto.Description?.Trim();

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SsnExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/investment/ssn/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSsn(int id)
        {
            var ssn = await _context.SSNs.FindAsync(id);
            if (ssn == null)
                return NotFound();

            _context.SSNs.Remove(ssn);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SsnExists(int id)
        {
            return _context.SSNs.Any(e => e.Id == id);
        }
    }
}