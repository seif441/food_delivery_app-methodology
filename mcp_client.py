import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def run_llm_mcp_flow():
    print("1. Initializing connection to local MCP Server...")
    # Tell the client how to spin up our server file
    server_params = StdioServerParameters(
        command="python",
        args=["mcp_server.py"]
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            print("2. Asking server for available tools...")
            tools = await session.list_tools()
            print(f"   Available tools found: {[t.name for t in tools.tools]}")
            
            print("\n3. LLM decides it needs to calculate delivery time for a 5km trip in high traffic.")
            print("   LLM sends execution request to MCP Server...")
            
            # The LLM requests the tool execution with specific arguments
            result = await session.call_tool(
                "calculate_delivery_time",
                arguments={"distance_km": 5.0, "traffic_level": "high"}
            )
            
            print("\n4. MCP Server successfully executed the function!")
            print(f"   FINAL RESULT TO LLM: {result.content[0].text}")

if __name__ == "__main__":
    asyncio.run(run_llm_mcp_flow())