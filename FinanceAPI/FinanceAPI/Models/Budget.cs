using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

[Table("Budget")]
public partial class Budget
{
    [Key]
    public int Id { get; set; }

    [StringLength(100)]
    public string? Purpose { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? AllocatedAmount { get; set; }

    [StringLength(10)]
    public string? Currency { get; set; }

    public DateOnly? PaymentDate { get; set; }

    [StringLength(10)]
    public string? Category { get; set; }

    [StringLength(100)]
    public string? Frequency { get; set; }

    [StringLength(10)]
    public string? Severity { get; set; }

    [StringLength(100)]
    public string? Description { get; set; }

    [InverseProperty("Budget")]
    public virtual ICollection<Backup> Backups { get; set; } = new List<Backup>();
}
