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
    public class StudentGETController : ControllerBase
    {
        private readonly FinanceDbContext _context;
        public StudentGETController(FinanceDbContext context) => _context = context;

        // GET: api/StudentGET
        [HttpGet]
        public async Task<IActionResult> GetStudentGETs()
        {
            var gets = await _context.Investments
                .Where(i => i.Type == InvestmentTypes.Student)
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
            return Ok(gets);
        }

        // GET: api/StudentGET/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStudentGET(int id)
        {
            var investment = await _context.Investments
                .Include(i => i.User)
                .Where(i => i.Id == id && i.Type == InvestmentTypes.Student)
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
            if (investment == null)
                return NotFound();
            return Ok(investment);
        }

        // POST: api/StudentGET
        [HttpPost]
        public async Task<IActionResult> CreateStudentGET([FromBody] Investment investment)
        {
            // Remove Id if set (let DB generate it)
            investment.Id = 0;
            _context.Investments.Add(investment);
            await _context.SaveChangesAsync();
            return Ok(investment);
        }

        // PUT: api/StudentGET/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudentGET(int id, [FromBody] Investment investment)
        {
            var existing = await _context.Investments.FindAsync(id);
            if (existing == null )
                return NotFound();
            // Update fields
            existing.UserId = investment.UserId;
            existing.Type = investment.Type != null ? investment.Type.Trim() : null;
            existing.Qty = investment.Qty;
            existing.Symbol = investment.Symbol != null ? investment.Symbol.Trim() : null;
            existing.Currency = investment.Currency != null ? investment.Currency.Trim() : null;
            existing.StartDate = investment.StartDate;
            existing.PolicyNo = investment.PolicyNo != null ? investment.PolicyNo.Trim() : null;
            existing.Financialnstitution = investment.Financialnstitution != null ? investment.Financialnstitution.Trim() : null;
            existing.Description = investment.Description != null ? investment.Description.Trim() : null;
            existing.CurrentValue = investment.CurrentValue;
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/StudentGET/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudentGETById(int id)
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
