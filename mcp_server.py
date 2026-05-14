from mcp.server.fastmcp import FastMCP

# 1. Initialize the MCP Server
mcp = FastMCP("Food Delivery Tools")

# 2. Define a tool that the LLM can execute
@mcp.tool()
def calculate_delivery_time(distance_km: float, traffic_level: str) -> str:
    """Calculates estimated food delivery time based on distance and traffic."""
    base_time = 15 # 15 minutes prep time
    travel_time = distance_km * 3 # 3 mins per km
    
    if traffic_level.lower() == "high":
        travel_time *= 1.5
        
    total_time = round(base_time + travel_time)
    return f"Estimated delivery time is {total_time} minutes."

if __name__ == "__main__":
    # Start the server (Listens via Standard Input/Output by default)
    mcp.run()