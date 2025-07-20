namespace FinanceAPI.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? Mobile1 { get; set; }
    public string? Mobile2 { get; set; }
    public string? LandLine { get; set; }
    public string? OfficeNo { get; set; }
    public string? Email1 { get; set; }
    public string? Email2 { get; set; }
    public string? WorkEmail { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Ssn { get; set; }
    public string? Aadhar { get; set; }
    public string? Pan { get; set; }
    public string? Notes { get; set; }
    public string? ShortName { get; set; } // Added
    public string? Group { get; set; }
    public List<UserAddressWithAddressDto>? Addresses { get; set; }
    public List<UserAddressDto>? UserAddresses { get; set; }
}
