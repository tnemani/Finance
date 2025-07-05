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
    public class StockController : ControllerBase
    {
        private readonly FinanceDbContext _context;
        public StockController(FinanceDbContext context) => _context = context;

        // GET: api/Stock
        [HttpGet]
        public async Task<IActionResult> GetStocks()
        {
            var stocks = await _context.Investments
                .Where(i => i.Type == InvestmentTypes.Stock)
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
            return Ok(stocks);
        }

        // GET: api/Stock/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStock(int id)
        {
            var stock = await _context.Investments
                .Where(i => i.Id == id && i.Type == InvestmentTypes.Stock)
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
            if (stock == null) return NotFound();
            return Ok(stock);
        }

        // POST: api/Stock
        [HttpPost]
        public async Task<IActionResult> CreateStock([FromBody] Investment investment)
        {
            // Trim all string fields before saving
            investment.Type = investment.Type != null ? investment.Type.Trim() : null;
            investment.Symbol = investment.Symbol != null ? investment.Symbol.Trim() : null;
            investment.Currency = investment.Currency != null ? investment.Currency.Trim() : null;
            investment.PolicyNo = investment.PolicyNo != null ? investment.PolicyNo.Trim() : null;
            investment.Financialnstitution = investment.Financialnstitution != null ? investment.Financialnstitution.Trim() : null;
            investment.Description = investment.Description != null ? investment.Description.Trim() : null;
            _context.Investments.Add(investment);
            await _context.SaveChangesAsync();
            // Return trimmed DTO/anonymous object
            var created = await _context.Investments
                .Where(i => i.Id == investment.Id)
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
            return Ok(created);
        }

        // PUT: api/Stock/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] Investment investment)
        {
            var existing = await _context.Investments.FindAsync(id);
            if (existing == null)
                return NotFound();
            // Update and trim fields
            existing.UserId = investment.UserId;
            existing.Type = investment.Type != null ? investment.Type.Trim() : null;
            existing.Qty = investment.Qty;
            existing.Symbol = investment.Symbol != null ? investment.Symbol.Trim() : null;
            existing.Currency = investment.Currency != null ? investment.Currency.Trim() : null;
            existing.StartDate = investment.StartDate;
            existing.PolicyNo = investment.PolicyNo != null ? investment.PolicyNo.Trim() : null;
            existing.Financialnstitution = investment.Financialnstitution != null ? investment.Financialnstitution.Trim() : null;
            existing.Description = investment.Description != null ? investment.Description.Trim() : null;
            await _context.SaveChangesAsync();
            // Return trimmed DTO/anonymous object
            var updated = await _context.Investments
                .Where(i => i.Id == id)
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
            return Ok(updated);
        }

        // DELETE: api/Stock/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStock(int id)
        {
            var investment = await _context.Investments.FindAsync(id);
            if (investment == null)
                return NotFound();
            _context.Investments.Remove(investment);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
