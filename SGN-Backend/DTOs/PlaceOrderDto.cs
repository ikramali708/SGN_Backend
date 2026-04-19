namespace SGN_Backend.DTOs
{
    public class PlaceOrderDto
    {
        public string ShippingAddress { get; set; } = null!;
        public string? Country { get; set; }
        public string? Province { get; set; }
        public string? City { get; set; }
        public string? FullAddress { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Comment { get; set; }
        public List<PlaceOrderItemDto> Items { get; set; } = new();
    }

    public class PlaceOrderItemDto
    {
        public int PlantId { get; set; }
        public int Quantity { get; set; }
    }
}
