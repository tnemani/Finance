using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

[Table("Jewlery")]
public partial class Jewlery
{
    [Key]
    public int Id { get; set; }

    [StringLength(10)]
    public string? Type { get; set; }

    [StringLength(100)]
    public string? Name { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? WeightInGrms { get; set; }

    [StringLength(200)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? PurchasedPrice { get; set; }

    public DateOnly? PurchasedOn { get; set; }

    public int? PurchasedAtId { get; set; }

    [ForeignKey("PurchasedAtId")]
    [InverseProperty("Jewleries")]
    public virtual Address? PurchasedAt { get; set; }
}
