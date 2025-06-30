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
    [Route("api/[controller]")]
    public class InvestmentController : ControllerBase
    {
        private readonly FinanceDbContext _context;
        public InvestmentController(FinanceDbContext context) => _context = context;

        // STOCK & MUTUAL FUNDS CRUD
        [HttpGet("stock")]
        public async Task<IActionResult> GetStocks()
        {
            var stocks = await _context.Investments
                .Where(i => i.Type == "Stock" || i.Type == "MutualFunds")
                .Include(i => i.User)
                .ToListAsync();
            var result = stocks.Select(i => new InvestmentDto {
                Id = i.Id,
                UserId = i.UserId,
                UserShortName = i.User != null && i.User.ShortName != null ? i.User.ShortName.Trim() : null,
                Type = i.Type != null ? i.Type.Trim() : null,
                Qty = i.Qty,
                CurrentValue = i.CurrentValue,
                Symbol = i.Symbol != null ? i.Symbol.Trim() : null,
                Currency = i.Currency != null ? i.Currency.Trim() : null,
                StartDate = i.StartDate,
                PolicyNo = i.PolicyNo != null ? i.PolicyNo.Trim() : null,
                Financialnstitution = i.Financialnstitution != null ? i.Financialnstitution.Trim() : null,
                Description = i.Description != null ? i.Description.Trim() : null
            }).ToList();
            return Ok(result);
        }

        [HttpPost("stock")]
        public async Task<IActionResult> CreateStock([FromBody] InvestmentDto dto)
        {
            if (dto.Type != "Stock" && dto.Type != "MutualFunds")
                return BadRequest("Type must be 'Stock' or 'MutualFunds'.");
            var investment = new Investment {
                UserId = dto.UserId,
                Type = dto.Type?.Trim(),
                Qty = dto.Qty,
                CurrentValue = dto.CurrentValue,
                Symbol = dto.Symbol?.Trim(),
                Currency = dto.Currency?.Trim(),
                StartDate = dto.StartDate,
                PolicyNo = dto.PolicyNo?.Trim(),
                Financialnstitution = dto.Financialnstitution?.Trim(),
                Description = dto.Description?.Trim()
            };
            _context.Investments.Add(investment);
            await _context.SaveChangesAsync();
            return Ok(investment);
        }

        [HttpPut("stock/{id}")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] InvestmentDto dto)
        {
            var existing = await _context.Investments.FindAsync(id);
            if (existing == null || (existing.Type != "Stock" && existing.Type != "MutualFunds"))
                return NotFound();
            existing.UserId = dto.UserId;
            existing.Type = dto.Type?.Trim();
            existing.Qty = dto.Qty;
            existing.CurrentValue = dto.CurrentValue;
            existing.Symbol = dto.Symbol?.Trim();
            existing.Currency = dto.Currency?.Trim();
            existing.StartDate = dto.StartDate;
            existing.PolicyNo = dto.PolicyNo?.Trim();
            existing.Financialnstitution = dto.Financialnstitution?.Trim();
            existing.Description = dto.Description?.Trim();
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("stock/{id}")]
        public async Task<IActionResult> DeleteStock(int id)
        {
            var investment = await _context.Investments.FindAsync(id);
            if (investment == null || (investment.Type != "Stock" && investment.Type != "MutualFunds"))
                return NotFound();
            _context.Investments.Remove(investment);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // STUDENT GET CRUD
        [HttpGet("studentget")]
        public async Task<IActionResult> GetStudentGETs()
        {
            var gets = await _context.Investments
                .Where(i => i.Type == "GET")
                .Include(i => i.User)
                .ToListAsync();
            var result = gets.Select(i => new InvestmentDto {
                Id = i.Id,
                UserId = i.UserId,
                UserShortName = i.User != null && i.User.ShortName != null ? i.User.ShortName.Trim() : null,
                Type = i.Type != null ? i.Type.Trim() : null,
                Qty = i.Qty,
                CurrentValue = i.CurrentValue,
                Symbol = i.Symbol != null ? i.Symbol.Trim() : null,
                Currency = i.Currency != null ? i.Currency.Trim() : null,
                StartDate = i.StartDate,
                PolicyNo = i.PolicyNo != null ? i.PolicyNo.Trim() : null,
                Financialnstitution = i.Financialnstitution != null ? i.Financialnstitution.Trim() : null,
                Description = i.Description != null ? i.Description.Trim() : null
            }).ToList();
            return Ok(result);
        }

        [HttpPost("studentget")]
        public async Task<IActionResult> CreateStudentGET([FromBody] InvestmentDto dto)
        {
            if (dto.Type != "GET")
                return BadRequest("Type must be 'GET'.");
            var investment = new Investment {
                UserId = dto.UserId,
                Type = dto.Type?.Trim(),
                Qty = dto.Qty,
                CurrentValue = dto.CurrentValue,
                Symbol = dto.Symbol?.Trim(),
                Currency = dto.Currency?.Trim(),
                StartDate = dto.StartDate,
                PolicyNo = dto.PolicyNo?.Trim(),
                Financialnstitution = dto.Financialnstitution?.Trim(),
                Description = dto.Description?.Trim()
            };
            _context.Investments.Add(investment);
            await _context.SaveChangesAsync();
            return Ok(investment);
        }

        [HttpPut("studentget/{id}")]
        public async Task<IActionResult> UpdateStudentGET(int id, [FromBody] InvestmentDto dto)
        {
            var existing = await _context.Investments.FindAsync(id);
            if (existing == null || existing.Type != "GET")
                return NotFound();
            existing.UserId = dto.UserId;
            existing.Type = dto.Type?.Trim();
            existing.Qty = dto.Qty;
            existing.CurrentValue = dto.CurrentValue;
            existing.Symbol = dto.Symbol?.Trim();
            existing.Currency = dto.Currency?.Trim();
            existing.StartDate = dto.StartDate;
            existing.PolicyNo = dto.PolicyNo?.Trim();
            existing.Financialnstitution = dto.Financialnstitution?.Trim();
            existing.Description = dto.Description?.Trim();
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("studentget/{id}")]
        public async Task<IActionResult> DeleteStudentGET(int id)
        {
            var investment = await _context.Investments.FindAsync(id);
            if (investment == null || investment.Type != "GET")
                return NotFound();
            _context.Investments.Remove(investment);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // POLICY CRUD (everything else)
        [HttpGet("policy")]
        public async Task<IActionResult> GetPolicies()
        {
            var policies = await _context.Investments
                .Where(i => i.Type != "Stock" && i.Type != "MutualFunds" && i.Type != "GET")
                .Include(i => i.User)
                .ToListAsync();
            var result = policies.Select(i => new InvestmentDto {
                Id = i.Id,
                UserId = i.UserId,
                UserShortName = i.User != null && i.User.ShortName != null ? i.User.ShortName.Trim() : null,
                Type = i.Type != null ? i.Type.Trim() : null,
                Qty = i.Qty,
                CurrentValue = i.CurrentValue,
                Symbol = i.Symbol != null ? i.Symbol.Trim() : null,
                Currency = i.Currency != null ? i.Currency.Trim() : null,
                StartDate = i.StartDate,
                PolicyNo = i.PolicyNo != null ? i.PolicyNo.Trim() : null,
                Financialnstitution = i.Financialnstitution != null ? i.Financialnstitution.Trim() : null,
                Description = i.Description != null ? i.Description.Trim() : null
            }).ToList();
            return Ok(result);
        }

        [HttpPost("policy")]
        public async Task<IActionResult> CreatePolicy([FromBody] InvestmentDto dto)
        {
            if (dto.Type == "Stock" || dto.Type == "MutualFunds" || dto.Type == "GET")
                return BadRequest("Type must not be 'Stock', 'MutualFunds', or 'GET'.");
            var investment = new Investment {
                UserId = dto.UserId,
                Type = dto.Type?.Trim(),
                Qty = dto.Qty,
                CurrentValue = dto.CurrentValue,
                Symbol = dto.Symbol?.Trim(),
                Currency = dto.Currency?.Trim(),
                StartDate = dto.StartDate,
                PolicyNo = dto.PolicyNo?.Trim(),
                Financialnstitution = dto.Financialnstitution?.Trim(),
                Description = dto.Description?.Trim()
            };
            _context.Investments.Add(investment);
            await _context.SaveChangesAsync();
            return Ok(investment);
        }

        [HttpPut("policy/{id}")]
        public async Task<IActionResult> UpdatePolicy(int id, [FromBody] InvestmentDto dto)
        {
            var existing = await _context.Investments.FindAsync(id);
            if (existing == null || existing.Type == "Stock" || existing.Type == "MutualFunds" || existing.Type == "GET")
                return NotFound();
            existing.UserId = dto.UserId;
            existing.Type = dto.Type?.Trim();
            existing.Qty = dto.Qty;
            existing.CurrentValue = dto.CurrentValue;
            existing.Symbol = dto.Symbol?.Trim();
            existing.Currency = dto.Currency?.Trim();
            existing.StartDate = dto.StartDate;
            existing.PolicyNo = dto.PolicyNo?.Trim();
            existing.Financialnstitution = dto.Financialnstitution?.Trim();
            existing.Description = dto.Description?.Trim();
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("policy/{id}")]
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
