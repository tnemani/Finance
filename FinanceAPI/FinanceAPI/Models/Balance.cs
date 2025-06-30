using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class Balance
{
    [Key]
    public int Id { get; set; }

    [StringLength(10)]
    public string? BankName { get; set; }

    [StringLength(10)]
    public string Type { get; set; } = null!;

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? MaxLimitAmount { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? RequiredAmount { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? InProgressAmount { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? BalanceAmount { get; set; }

    [StringLength(50)]
    public string? Currency { get; set; }

    [StringLength(200)]
    public string? Remarks { get; set; }

    public int? BankDetails { get; set; }
}
