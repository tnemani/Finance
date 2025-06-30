using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class Earning
{
    [Key]
    public int Id { get; set; }

    [StringLength(50)]
    public string? Type { get; set; }

    [StringLength(100)]
    public string? Frequency { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? StartDate { get; set; }

    public int? Sender { get; set; }

    public int? Receiver { get; set; }

    [StringLength(100)]
    public string? Item { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? Amount { get; set; }

    [StringLength(10)]
    public string? Currency { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? EndDate { get; set; }

    public int OwnerId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? LastUpdatedDate { get; set; }

    [StringLength(100)]
    public string? Description { get; set; }

    [ForeignKey("OwnerId")]
    [InverseProperty("EarningOwners")]
    public virtual User Owner { get; set; } = null!;

    [ForeignKey("Receiver")]
    [InverseProperty("EarningReceiverNavigations")]
    public virtual User? ReceiverNavigation { get; set; }

    [ForeignKey("Sender")]
    [InverseProperty("EarningSenderNavigations")]
    public virtual User? SenderNavigation { get; set; }
}
