using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class User
{
    [Key]
    public int Id { get; set; }

    [StringLength(25)]
    public string? LastName { get; set; }

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? MiddleName { get; set; }

    [StringLength(20)]
    public string? Mobile1 { get; set; }

    [StringLength(20)]
    public string? Mobile2 { get; set; }

    [StringLength(20)]
    public string? LandLine { get; set; }

    [StringLength(20)]
    public string? OfficeNo { get; set; }

    [StringLength(50)]
    public string? Email1 { get; set; }

    [StringLength(50)]
    public string? Email2 { get; set; }

    [StringLength(50)]
    public string? WorkEmail { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? DateOfBirth { get; set; }

    [Column("SSN")]
    [StringLength(20)]
    public string? Ssn { get; set; }

    [StringLength(20)]
    public string? Aadhar { get; set; }

    [Column("PAN")]
    [StringLength(20)]
    public string? Pan { get; set; }

    [StringLength(200)]
    public string? Notes { get; set; }

    [StringLength(100)]
    public string? ShortName { get; set; } // Added

    [StringLength(50)]
    public string? Group { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<AccountDetail> AccountDetails { get; set; } = new List<AccountDetail>();

    [InverseProperty("Owner")]
    public virtual ICollection<Earning> EarningOwners { get; set; } = new List<Earning>();

    [InverseProperty("ReceiverNavigation")]
    public virtual ICollection<Earning> EarningReceiverNavigations { get; set; } = new List<Earning>();

    [InverseProperty("SenderNavigation")]
    public virtual ICollection<Earning> EarningSenderNavigations { get; set; } = new List<Earning>();

    [InverseProperty("User")]
    public virtual ICollection<Investment> Investments { get; set; } = new List<Investment>();

    [InverseProperty("DestinationUser")]
    public virtual ICollection<PersonTransaction> PersonTransactionDestinationUsers { get; set; } = new List<PersonTransaction>();

    [InverseProperty("SourceUser")]
    public virtual ICollection<PersonTransaction> PersonTransactionSourceUsers { get; set; } = new List<PersonTransaction>();

    [InverseProperty("User")]
    public virtual ICollection<UserAddress> UserAddresses { get; set; } = new List<UserAddress>();
}
