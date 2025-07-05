using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceAPI.Models;
using FinanceAPI.Data;
using FinanceAPI.Constants;

namespace FinanceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PolicyController : ControllerBase
    {
        private readonly FinanceDbContext _context;
        public PolicyController(FinanceDbContext context) => _context = context;

        // GET: api/Policy
        [HttpGet]
        public async Task<IActionResult> GetPolicies()
        {
            var policies = await _context.Investments
                .Where(i => i.Type == InvestmentTypes.Policy)
                .Include(i => i.User)
                .Select(i => new {
                    i.Id,
                    i.UserId,
                    UserShortName = i.User != null && i.User.ShortName != null ? i.User.ShortName.Trim() : null,
                    Type = i.Type != null ? i.Type.Trim() : null,
                    Qty = i.Qty,
                    Symbol = i.Symbol != null ? i.Symbol.Trim() : null,
                    Currency = i.Currency != null ? i.Currency.Trim() : null,
                    StartDate = i.StartDate,
                    PolicyNo = i.PolicyNo != null ? i.PolicyNo.Trim() : null,
                    Financialnstitution = i.Financialnstitution != null ? i.Financialnstitution.Trim() : null,
                    Description = i.Description != null ? i.Description.Trim() : null
                })
                .ToListAsync();
            return Ok(policies);
        }

        // GET: api/Policy/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPolicy(int id)
        {
            var policy = await _context.Investments
                .Where(i => i.Id == id && i.Type == InvestmentTypes.Policy)
                .Include(i => i.User)
                .Select(i => new {
                    i.Id,
                    i.UserId,
                    UserShortName = i.User != null && i.User.ShortName != null ? i.User.ShortName.Trim() : null,
                    Type = i.Type != null ? i.Type.Trim() : null,
                    Qty = i.Qty,
                    Symbol = i.Symbol != null ? i.Symbol.Trim() : null,
                    Currency = i.Currency != null ? i.Currency.Trim() : null,
                    StartDate = i.StartDate,
                    PolicyNo = i.PolicyNo != null ? i.PolicyNo.Trim() : null,
                    Financialnstitution = i.Financialnstitution != null ? i.Financialnstitution.Trim() : null,
                    Description = i.Description != null ? i.Description.Trim() : null
                })
                .FirstOrDefaultAsync();
            if (policy == null) return NotFound();
            return Ok(policy);
        }

        // POST: api/Policy
        [HttpPost]
        public async Task<IActionResult> CreatePolicy([FromBody] Investment investment)
        {
            if (investment.Type == "Stock" || investment.Type == "MutualFunds" || investment.Type == "GET")
                return BadRequest("Type must not be 'Stock', 'MutualFunds', or 'GET'.");
            _context.Investments.Add(investment);
            await _context.SaveChangesAsync();
            return Ok(investment);
        }

        // PUT: api/Policy/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePolicy(int id, [FromBody] Investment investment)
        {
            var existing = await _context.Investments.FindAsync(id);
            if (existing == null || existing.Type == "Stock" || existing.Type == "MutualFunds" || existing.Type == "GET")
                return NotFound();
            // Update fields
            existing.UserId = investment.UserId;
            existing.Type = investment.Type;
            existing.Qty = investment.Qty;
            existing.Symbol = investment.Symbol;
            existing.Currency = investment.Currency;
            existing.StartDate = investment.StartDate;
            existing.PolicyNo = investment.PolicyNo;
            existing.Financialnstitution = investment.Financialnstitution;
            existing.Description = investment.Description;
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/Policy/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePolicy(int id)
        {
            var investment = await _context.Investments.FindAsync(id);
            if (investment == null || investment.Type == "Stock" || investment.Type == "MutualFunds" || investment.Type == "GET")
                return NotFound();
            _context.Investments.Remove(investment);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
