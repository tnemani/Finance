using System;
using Microsoft.AspNetCore.Mvc;
using FinanceAPI.Models;
using FinanceAPI.DTOs;
using FinanceAPI.Data;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly FinanceDbContext _context;
    public UsersController(FinanceDbContext context) => _context = context;

    [HttpGet]
    public ActionResult<IEnumerable<UserDto>> GetUsers()
    {
        var users = _context.Users
            .Include(u => u.UserAddresses)
            .ThenInclude(ua => ua.Address)
            .ToList()
            .Select(u => new UserDto
            {
                Id = u.Id,
                LastName = u.LastName?.Trim(),
                FirstName = u.FirstName?.Trim(),
                MiddleName = u.MiddleName?.Trim(),
                Mobile1 = u.Mobile1?.Trim(),
                Mobile2 = u.Mobile2?.Trim(),
                LandLine = u.LandLine?.Trim(),
                OfficeNo = u.OfficeNo?.Trim(),
                Email1 = u.Email1?.Trim(),
                Email2 = u.Email2?.Trim(),
                WorkEmail = u.WorkEmail?.Trim(),
                DateOfBirth = u.DateOfBirth.HasValue ? u.DateOfBirth.Value.ToString("yyyy-MM-dd") : null,
                Ssn = u.Ssn?.Trim(),
                Aadhar = u.Aadhar?.Trim(),
                Pan = u.Pan?.Trim(),
                Notes = u.Notes?.Trim(),
                ShortName = u.ShortName?.Trim(), // Added
                Group = u.Group?.Trim(),
                Addresses = u.UserAddresses?.Where(ua => ua.Address != null).Select(ua => new UserAddressWithAddressDto
                {
                    Id = ua.Id,
                    UserId = ua.UserId,
                    AddressId = ua.AddressId,
                    StartDate = ua.StartDate,
                    EndDate = ua.EndDate,
                    AddressType = ua.Address!.AddressType?.Trim(),
                    HouseNo = ua.Address!.HouseNo?.Trim(),
                    Line1 = ua.Address!.Line1?.Trim(),
                    Line2 = ua.Address!.Line2?.Trim(),
                    City = ua.Address!.City?.Trim(),
                    State = ua.Address!.State?.Trim(),
                    Country = ua.Address!.Country?.Trim(),
                    Zip = ua.Address!.Zip?.Trim(),
                    Description = ua.Address!.Description?.Trim()
                }).ToList(),
                UserAddresses = u.UserAddresses?.Select(ua => new UserAddressDto
                {
                    Id = ua.Id,
                    UserId = ua.UserId,
                    AddressId = ua.AddressId,
                    StartDate = ua.StartDate,
                    EndDate = ua.EndDate
                }).ToList()
            }).ToList();
        return users;
    }

    [HttpGet("{id}")]
    public ActionResult<UserDto> GetUser(int id)
    {
        var u = _context.Users
            .Include(u => u.UserAddresses)
            .ThenInclude(ua => ua.Address)
            .FirstOrDefault(u => u.Id == id);
        if (u == null) return NotFound();
        return new UserDto
        {
            Id = u.Id,
            LastName = u.LastName?.Trim(),
            FirstName = u.FirstName?.Trim(),
            MiddleName = u.MiddleName?.Trim(),
            Mobile1 = u.Mobile1?.Trim(),
            Mobile2 = u.Mobile2?.Trim(),
            LandLine = u.LandLine?.Trim(),
            OfficeNo = u.OfficeNo?.Trim(),
            Email1 = u.Email1?.Trim(),
            Email2 = u.Email2?.Trim(),
            WorkEmail = u.WorkEmail?.Trim(),
            DateOfBirth = u.DateOfBirth.HasValue ? u.DateOfBirth.Value.ToString("yyyy-MM-dd") : null,
            Ssn = u.Ssn?.Trim(),
            Aadhar = u.Aadhar?.Trim(),
            Pan = u.Pan?.Trim(),
            Notes = u.Notes?.Trim(),
            ShortName = u.ShortName?.Trim(), // Added
            Group = u.Group?.Trim(),
            Addresses = u.UserAddresses?.Where(ua => ua.Address != null).Select(ua => new UserAddressWithAddressDto
            {
                Id = ua.Id,
                UserId = ua.UserId,
                AddressId = ua.AddressId,
                StartDate = ua.StartDate,
                EndDate = ua.EndDate,
                AddressType = ua.Address!.AddressType?.Trim(),
                HouseNo = ua.Address!.HouseNo?.Trim(),
                Line1 = ua.Address!.Line1?.Trim(),
                Line2 = ua.Address!.Line2?.Trim(),
                City = ua.Address!.City?.Trim(),
                State = ua.Address!.State?.Trim(),
                Country = ua.Address!.Country?.Trim(),
                Zip = ua.Address!.Zip?.Trim(),
                Description = ua.Address!.Description?.Trim()
            }).ToList(),
            UserAddresses = u.UserAddresses?.Select(ua => new UserAddressDto
            {
                Id = ua.Id,
                UserId = ua.UserId,
                AddressId = ua.AddressId,
                StartDate = ua.StartDate,
                EndDate = ua.EndDate
            }).ToList()
        };
    }

    [HttpPost]
    public ActionResult<UserDto> PostUser(UserDto dto)
    {
        var user = new User
        {
            LastName = dto.LastName?.Trim(),
            FirstName = dto.FirstName?.Trim(),
            MiddleName = dto.MiddleName?.Trim(),
            Mobile1 = dto.Mobile1?.Trim(),
            Mobile2 = dto.Mobile2?.Trim(),
            LandLine = dto.LandLine?.Trim(),
            OfficeNo = dto.OfficeNo?.Trim(),
            Email1 = dto.Email1?.Trim(),
            Email2 = dto.Email2?.Trim(),
            WorkEmail = dto.WorkEmail?.Trim(),
            DateOfBirth = !string.IsNullOrEmpty(dto.DateOfBirth) ? DateTime.Parse(dto.DateOfBirth) : null,
            Ssn = dto.Ssn?.Trim(),
            Aadhar = dto.Aadhar?.Trim(),
            Pan = dto.Pan?.Trim(),
            Notes = dto.Notes?.Trim(),
            ShortName = dto.ShortName?.Trim(), // Added
            Group = dto.Group?.Trim()
        };
        _context.Users.Add(user);
        _context.SaveChanges();
        // Handle UserAddresses
        if (dto.UserAddresses != null)
        {
            foreach (var ua in dto.UserAddresses)
            {
                var userAddress = new UserAddress
                {
                    UserId = user.Id,
                    AddressId = ua.AddressId,
                    StartDate = ua.StartDate,
                    EndDate = ua.EndDate
                };
                _context.UserAddresses.Add(userAddress);
            }
            _context.SaveChanges();
        }
        dto.Id = user.Id;
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, dto);
    }

    [HttpPut("{id}")]
    public IActionResult PutUser(int id, UserDto dto)
    {
        var user = _context.Users.Include(u => u.UserAddresses).FirstOrDefault(u => u.Id == id);
        if (user == null) return NotFound();
        user.LastName = dto.LastName?.Trim();
        user.FirstName = dto.FirstName?.Trim();
        user.MiddleName = dto.MiddleName?.Trim();
        user.Mobile1 = dto.Mobile1?.Trim();
        user.Mobile2 = dto.Mobile2?.Trim();
        user.LandLine = dto.LandLine?.Trim();
        user.OfficeNo = dto.OfficeNo?.Trim();
        user.Email1 = dto.Email1?.Trim();
        user.Email2 = dto.Email2?.Trim();
        user.WorkEmail = dto.WorkEmail?.Trim();
        user.DateOfBirth = !string.IsNullOrEmpty(dto.DateOfBirth) ? DateTime.Parse(dto.DateOfBirth) : null;
        user.Ssn = dto.Ssn?.Trim();
        user.Aadhar = dto.Aadhar?.Trim();
        user.Pan = dto.Pan?.Trim();
        user.Notes = dto.Notes?.Trim();
        user.ShortName = dto.ShortName?.Trim(); // Added
        user.Group = dto.Group?.Trim();
        // Update UserAddresses
        if (dto.UserAddresses != null)
        {
            // Remove existing links not in the new list
            var toRemove = user.UserAddresses.Where(ua => !dto.UserAddresses.Any(d => d.AddressId == ua.AddressId)).ToList();
            foreach (var rem in toRemove)
                _context.UserAddresses.Remove(rem);
            // Update or add links
            foreach (var uaDto in dto.UserAddresses)
            {
                var existing = user.UserAddresses.FirstOrDefault(ua => ua.AddressId == uaDto.AddressId);
                if (existing != null)
                {
                    existing.StartDate = uaDto.StartDate;
                    existing.EndDate = uaDto.EndDate;
                }
                else
                {
                    var newUa = new UserAddress
                    {
                        UserId = user.Id,
                        AddressId = uaDto.AddressId,
                        StartDate = uaDto.StartDate,
                        EndDate = uaDto.EndDate
                    };
                    _context.UserAddresses.Add(newUa);
                }
            }
        }
        _context.SaveChanges();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteUser(int id)
    {
        var user = _context.Users.Include(u => u.UserAddresses).FirstOrDefault(u => u.Id == id);
        if (user == null) return NotFound();
        // Remove all UserAddresses first
        foreach (var ua in user.UserAddresses.ToList())
        {
            _context.UserAddresses.Remove(ua);
        }
        _context.Users.Remove(user);
        _context.SaveChanges();
        return NoContent();
    }
}
