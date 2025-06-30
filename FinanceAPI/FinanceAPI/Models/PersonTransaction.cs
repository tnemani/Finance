using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class PersonTransaction
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    public int SourceUserId { get; set; }

    [Required]
    public int DestinationUserId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? StartDate { get; set; } // Now nullable

    [StringLength(20)]
    public string Currency { get; set; } = null!;

    [Column(TypeName = "decimal(18, 0)")]
    public decimal Amount { get; set; }

    [StringLength(400)]
    public string? Purpose { get; set; } // Added

    [Column(TypeName = "datetime")]
    public DateTime? ScheduledEndDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ActualEndDate { get; set; }

    [StringLength(1000)]
    public string? Reason { get; set; }

    [StringLength(20)]
    public string? Status { get; set; }

    public virtual User? DestinationUser { get; set; }
    public virtual User? SourceUser { get; set; }
}
