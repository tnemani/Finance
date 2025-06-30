using Microsoft.AspNetCore.Mvc;
using FinanceAPI.Models;
using FinanceAPI.DTOs;
using FinanceAPI.Data;

[ApiController]
[Route("api/[controller]")]
public class UserAddressesController : ControllerBase
{
    private readonly FinanceDbContext _context;
    public UserAddressesController(FinanceDbContext context) => _context = context;

    [HttpGet]
    public ActionResult<IEnumerable<UserAddressDto>> GetUserAddresses()
    {
        return _context.UserAddresses.Select(ua => new UserAddressDto
        {
            Id = ua.Id,
            UserId = ua.UserId,
            AddressId = ua.AddressId,
            StartDate = ua.StartDate,
            EndDate = ua.EndDate
        }).ToList();
    }

    [HttpGet("{id}")]
    public ActionResult<UserAddressDto> GetUserAddress(int id)
    {
        var ua = _context.UserAddresses.Find(id);
        if (ua == null) return NotFound();
        return new UserAddressDto
        {
            Id = ua.Id,
            UserId = ua.UserId,
            AddressId = ua.AddressId,
            StartDate = ua.StartDate,
            EndDate = ua.EndDate
        };
    }

    [HttpPost]
    public ActionResult<UserAddressDto> PostUserAddress(UserAddressDto dto)
    {
        var userAddress = new UserAddress
        {
            UserId = dto.UserId,
            AddressId = dto.AddressId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };
        _context.UserAddresses.Add(userAddress);
        _context.SaveChanges();
        dto.Id = userAddress.Id;
        return CreatedAtAction(nameof(GetUserAddress), new { id = userAddress.Id }, dto);
    }

    [HttpPut("{id}")]
    public IActionResult PutUserAddress(int id, UserAddressDto dto)
    {
        var userAddress = _context.UserAddresses.Find(id);
        if (userAddress == null) return NotFound();
        userAddress.UserId = dto.UserId;
        userAddress.AddressId = dto.AddressId;
        userAddress.StartDate = dto.StartDate;
        userAddress.EndDate = dto.EndDate;
        _context.SaveChanges();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteUserAddress(int id)
    {
        var userAddress = _context.UserAddresses.Find(id);
        if (userAddress == null) return NotFound();
        _context.UserAddresses.Remove(userAddress);
        _context.SaveChanges();
        return NoContent();
    }
}
