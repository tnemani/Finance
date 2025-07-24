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
    [Route("api/investment/401k")]
    public class FourOOneKController : ControllerBase
    {
        private readonly FinanceDbContext _context;
        public FourOOneKController(FinanceDbContext context) => _context = context;

        // GET: api/investment/401k
        [HttpGet]
        public async Task<IActionResult> GetFourOOneKs()
        {
            var accounts = await _context.FourOOneKs
                .Include(f => f.User)
                .ToListAsync();

            var result = accounts.Select(f => new FourOOneKDto
            {
                Id = f.Id,
                UserId = f.UserId,
                UserShortName = f.User?.ShortName?.Trim(),
                AssetClass = f.AssetClass?.Trim(),
                PolicyNo = f.PolicyNo?.Trim(),
                Term = f.Term?.Trim(),
                Currency = f.Currency?.Trim(),
                StartDate = f.StartDate,
                MaturityDate = f.MaturityDate,
                InvestmentAmount = f.InvestmentAmount,
                CurrentAmount = f.CurrentAmount,
                Description = f.Description?.Trim()
            }).ToList();

            return Ok(result);
        }

        // GET: api/investment/401k/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFourOOneK(int id)
        {
            var account = await _context.FourOOneKs
                .Include(f => f.User)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (account == null)
                return NotFound();

            var result = new FourOOneKDto
            {
                Id = account.Id,
                UserId = account.UserId,
                UserShortName = account.User?.ShortName?.Trim(),
                AssetClass = account.AssetClass?.Trim(),
                PolicyNo = account.PolicyNo?.Trim(),
                Term = account.Term?.Trim(),
                Currency = account.Currency?.Trim(),
                StartDate = account.StartDate,
                MaturityDate = account.MaturityDate,
                InvestmentAmount = account.InvestmentAmount,
                CurrentAmount = account.CurrentAmount,
                Description = account.Description?.Trim()
            };

            return Ok(result);
        }

        // POST: api/investment/401k
        [HttpPost]
        public async Task<IActionResult> CreateFourOOneK([FromBody] FourOOneKDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var account = new FourOOneK
            {
                UserId = dto.UserId,
                AssetClass = dto.AssetClass?.Trim(),
                PolicyNo = dto.PolicyNo?.Trim(),
                Term = dto.Term?.Trim(),
                Currency = dto.Currency?.Trim(),
                StartDate = dto.StartDate,
                MaturityDate = dto.MaturityDate,
                InvestmentAmount = dto.InvestmentAmount,
                CurrentAmount = dto.CurrentAmount,
                Description = dto.Description?.Trim()
            };

            _context.FourOOneKs.Add(account);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFourOOneK), new { id = account.Id }, dto);
        }

        // PUT: api/investment/401k/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFourOOneK(int id, [FromBody] FourOOneKDto dto)
        {
            if (id != dto.Id)
                return BadRequest("ID mismatch");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var account = await _context.FourOOneKs.FindAsync(id);
            if (account == null)
                return NotFound();

            account.UserId = dto.UserId;
            account.AssetClass = dto.AssetClass?.Trim();
            account.PolicyNo = dto.PolicyNo?.Trim();
            account.Term = dto.Term?.Trim();
            account.Currency = dto.Currency?.Trim();
            account.StartDate = dto.StartDate;
            account.MaturityDate = dto.MaturityDate;
            account.InvestmentAmount = dto.InvestmentAmount;
            account.CurrentAmount = dto.CurrentAmount;
            account.Description = dto.Description?.Trim();

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FourOOneKExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/investment/401k/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFourOOneK(int id)
        {
            var account = await _context.FourOOneKs.FindAsync(id);
            if (account == null)
                return NotFound();

            _context.FourOOneKs.Remove(account);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FourOOneKExists(int id)
        {
            return _context.FourOOneKs.Any(e => e.Id == id);
        }
    }
}