using System;
using FinanceAPI.Models;

namespace FinanceAPI.DTOs
{
    public class BalanceDto
    {
        public int Id { get; set; }
        public string? BankName { get; set; }
        public string? Type { get; set; }
        public decimal? MaxLimitAmount { get; set; }
        public decimal? RequiredAmount { get; set; }
        public decimal? InProgressAmount { get; set; }
        public decimal? BalanceAmount { get; set; }
        public string? Currency { get; set; }
        public string? Remarks { get; set; }
        public int? BankDetails { get; set; }

        public BalanceDto() { }
        public BalanceDto(Balance model)
        {
            Id = model.Id;
            BankName = model.BankName?.Trim();
            Type = model.Type?.Trim();
            MaxLimitAmount = model.MaxLimitAmount;
            RequiredAmount = model.RequiredAmount;
            InProgressAmount = model.InProgressAmount;
            BalanceAmount = model.BalanceAmount;
            Currency = model.Currency?.Trim();
            Remarks = model.Remarks?.Trim();
            BankDetails = model.BankDetails;
        }
        public Balance ToModel()
        {
            return new Balance
            {
                Id = this.Id,
                BankName = this.BankName,
                Type = this.Type ?? string.Empty,
                MaxLimitAmount = this.MaxLimitAmount,
                RequiredAmount = this.RequiredAmount,
                InProgressAmount = this.InProgressAmount,
                BalanceAmount = this.BalanceAmount,
                Currency = this.Currency,
                Remarks = this.Remarks,
                BankDetails = this.BankDetails
            };
        }
    }
}
