using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceAPI.Models;
using FinanceAPI.Data;

namespace FinanceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockController : ControllerBase
    {
        private readonly FinanceDbContext _context;
        public StockController(FinanceDbContext context) => _context = context;

        // GET: api/Stock
        [HttpGet]
        public async Task<IActionResult> GetStocks()
        {
            var stocks = await _context.Investments
                .Where(i => i.Type == "Stock" || i.Type == "MutualFunds")
                .Include(i => i.User)
                .Select(i => new {
                    i.Id,
                    i.UserId,
                    UserShortName = i.User != null ? i.User.ShortName : null,
                    i.Type,
                    i.Qty,
                    i.Symbol,
                    i.Currency,
                    i.StartDate,
                    i.PolicyNo,
                    i.Financialnstitution,
                    i.Description
                })
                .ToListAsync();
            return Ok(stocks);
        }

        // POST: api/Stock
        [HttpPost]
        public async Task<IActionResult> CreateStock([FromBody] Investment investment)
        {
            if (investment.Type != "Stock" && investment.Type != "MutualFunds")
                return BadRequest("Type must be 'Stock' or 'MutualFunds'.");
            _context.Investments.Add(investment);
            await _context.SaveChangesAsync();
            return Ok(investment);
        }

        // PUT: api/Stock/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] Investment investment)
        {
            var existing = await _context.Investments.FindAsync(id);
            if (existing == null || (existing.Type != "Stock" && existing.Type != "MutualFunds"))
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

        // DELETE: api/Stock/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStock(int id)
        {
            var investment = await _context.Investments.FindAsync(id);
            if (investment == null || (investment.Type != "Stock" && investment.Type != "MutualFunds"))
                return NotFound();
            _context.Investments.Remove(investment);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
