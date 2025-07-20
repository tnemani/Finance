using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class Address
{
    [Key]
    public int Id { get; set; }

    [StringLength(20)]
    public string? AddressType { get; set; }

    [StringLength(20)]
    public string? HouseNo { get; set; }

    [StringLength(100)]
    public string? Line1 { get; set; }

    [StringLength(100)]
    public string? Line2 { get; set; }

    [StringLength(50)]
    public string? City { get; set; }

    [StringLength(50)]
    public string? State { get; set; }

    [StringLength(50)]
    public string? Country { get; set; }

    [StringLength(10)]
    public string? Zip { get; set; }

    [StringLength(100)]
    public string? Description { get; set; }

    [StringLength(100)]
    public string? ShortName { get; set; } // Add ShortName property

    [InverseProperty("PurchasedFromNavigation")]
    public virtual ICollection<Jewlery> Jewleries { get; set; } = new List<Jewlery>();

    [InverseProperty("Address")]
    public virtual ICollection<UserAddress> UserAddresses { get; set; } = new List<UserAddress>();
}
