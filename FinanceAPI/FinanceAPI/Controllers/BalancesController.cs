using Microsoft.AspNetCore.Mvc;
using FinanceAPI.DTOs;
using FinanceAPI.Models;
using FinanceAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FinanceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BalancesController : ControllerBase
    {
        private readonly FinanceDbContext _context;
        public BalancesController(FinanceDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BalanceDto>>> GetBalances()
        {
            var balances = await _context.Balances.ToListAsync();
            return Ok(balances.Select(b => new BalanceDto(b)));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BalanceDto>> GetBalance(int id)
        {
            var balance = await _context.Balances.FindAsync(id);
            if (balance == null) return NotFound();
            return Ok(new BalanceDto(balance));
        }

        [HttpPost]
        public async Task<ActionResult<BalanceDto>> CreateBalance(BalanceDto dto)
        {
            var balance = dto.ToModel();
            _context.Balances.Add(balance);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBalance), new { id = balance.Id }, new BalanceDto(balance));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBalance(int id, BalanceDto dto)
        {
            if (id != dto.Id) return BadRequest();
            var balance = await _context.Balances.FindAsync(id);
            if (balance == null) return NotFound();
            balance.BankName = dto.BankName;
            balance.Type = dto.Type ?? string.Empty;
            balance.MaxLimitAmount = dto.MaxLimitAmount;
            balance.RequiredAmount = dto.RequiredAmount;
            balance.InProgressAmount = dto.InProgressAmount;
            balance.BalanceAmount = dto.BalanceAmount;
            balance.Currency = dto.Currency;
            balance.Remarks = dto.Remarks;
            balance.BankDetails = dto.BankDetails;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBalance(int id)
        {
            var balance = await _context.Balances.FindAsync(id);
            if (balance == null) return NotFound();
            _context.Balances.Remove(balance);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
