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
    public class StudentGETController : ControllerBase
    {
        private readonly FinanceDbContext _context;
        public StudentGETController(FinanceDbContext context) => _context = context;

        // GET: api/StudentGET
        [HttpGet]
        public async Task<IActionResult> GetStudentGETs()
        {
            var gets = await _context.Investments
                .Where(i => i.Type == "GET")
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
            return Ok(gets);
        }

        // POST: api/StudentGET
        [HttpPost]
        public async Task<IActionResult> CreateStudentGET([FromBody] Investment investment)
        {
            if (investment.Type != "GET")
                return BadRequest("Type must be 'GET'.");
            _context.Investments.Add(investment);
            await _context.SaveChangesAsync();
            return Ok(investment);
        }

        // PUT: api/StudentGET/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudentGET(int id, [FromBody] Investment investment)
        {
            var existing = await _context.Investments.FindAsync(id);
            if (existing == null || existing.Type != "GET")
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

        // DELETE: api/StudentGET/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudentGET(int id)
        {
            var investment = await _context.Investments.FindAsync(id);
            if (investment == null || investment.Type != "GET")
                return NotFound();
            _context.Investments.Remove(investment);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
