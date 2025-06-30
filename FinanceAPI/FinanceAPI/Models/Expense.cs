using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class Expense
{
    [Key]
    public int Id { get; set; }

    [StringLength(100)]
    public string? Purpose { get; set; }

    public DateOnly? PaymentDate { get; set; }

    public DateOnly? TranscationDate { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? BudgetAmount { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? OccuredAmount { get; set; }

    [StringLength(10)]
    public string? Currency { get; set; }

    [StringLength(10)]
    public string? Status { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? AvoidAmount { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal AvoidReason { get; set; }
}
