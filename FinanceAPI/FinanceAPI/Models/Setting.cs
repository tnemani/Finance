using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class Setting
{
    [Key]
    public int Id { get; set; }

    [StringLength(100)]
    public string KeyName { get; set; } = null!;

    [StringLength(50)]
    public string Value { get; set; } = null!;

    [StringLength(10)]
    public string? Units { get; set; }

    [StringLength(100)]
    public string? Notes { get; set; }
}
