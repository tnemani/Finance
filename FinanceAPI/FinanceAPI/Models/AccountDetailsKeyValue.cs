using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceAPI.Models;

public partial class AccountDetailsKeyValue
{
    [Key]
    public int Id { get; set; }

    public int AccountId { get; set; }

    [StringLength(100)]
    public string KeyName { get; set; } = null!;

    [StringLength(100)]
    public string Value { get; set; } = null!;

    [StringLength(200)]
    public string? Description { get; set; }
}
