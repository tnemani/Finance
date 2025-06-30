using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class UserAddress
{
    [Key]
    public int Id { get; set; }

    public int? UserId { get; set; }

    public int? AddressId { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    [ForeignKey("AddressId")]
    [InverseProperty("UserAddresses")]
    public virtual Address? Address { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserAddresses")]
    public virtual User? User { get; set; }
}
