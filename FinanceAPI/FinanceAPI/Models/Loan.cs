using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class Loan
{
    [Key]
    public int Id { get; set; }

    public int AssetId { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? LoanAmount { get; set; }

    public DateOnly? Startdate { get; set; }

    public DateOnly? EndDate { get; set; }

    [Column(TypeName = "decimal(18, 0)")]
    public decimal? PinicipalInterest { get; set; }

    [Column("Tax_Insurance", TypeName = "decimal(18, 0)")]
    public decimal? TaxInsurance { get; set; }

    [Column("Eearthquake_Insurance", TypeName = "decimal(18, 0)")]
    public decimal? EearthquakeInsurance { get; set; }

    [Column("Equipemnet_Insurance", TypeName = "decimal(18, 0)")]
    public decimal? EquipemnetInsurance { get; set; }

    [Column("Other_Insurance", TypeName = "decimal(18, 0)")]
    public decimal? OtherInsurance { get; set; }

    [Column("Wear_Tear_Repairs", TypeName = "decimal(18, 0)")]
    public decimal? WearTearRepairs { get; set; }

    [Column("UnexpectedYearly_Expenses", TypeName = "decimal(18, 0)")]
    public decimal? UnexpectedYearlyExpenses { get; set; }

    [StringLength(200)]
    public string? Description { get; set; }

    [ForeignKey("AssetId")]
    [InverseProperty("Loans")]
    public virtual Asset Asset { get; set; } = null!;
}
