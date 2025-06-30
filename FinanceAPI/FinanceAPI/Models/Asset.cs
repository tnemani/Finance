using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class Asset
{
    [Key]
    public int Id { get; set; }

    [StringLength(100)]
    public string? Name { get; set; }

    [StringLength(200)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? PurchasedPice { get; set; }

    public DateOnly? PurchasedDate { get; set; }

    [StringLength(20)]
    public string? Currency { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? CurentValue { get; set; }

    public DateOnly? LastUpdated { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? SalestaxWithMiscelanious { get; set; }

    [InverseProperty("Asset")]
    public virtual ICollection<Loan> Loans { get; set; } = new List<Loan>();
}
