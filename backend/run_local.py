#!/usr/bin/env python3
"""
Local Development Runner

Script to run the MemoryBook backend locally for development.
"""

import os
import sys
import argparse

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()


def main():
    """Run the FastAPI application."""
    parser = argparse.ArgumentParser(description="Run MemoryBook backend locally")
    parser.add_argument(
        "--host",
        default=os.getenv("HOST", "127.0.0.1"),
        help="Host to bind to (default: 127.0.0.1)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("PORT", "8000")),
        help="Port to bind to (default: 8000)"
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        default=True,
        help="Enable auto-reload (default: True)"
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        default=os.getenv("DEBUG", "false").lower() == "true",
        help="Enable debug mode"
    )
    
    args = parser.parse_args()
    
    # Set environment variables
    os.environ.setdefault("DEBUG", str(args.debug).lower())
    
    # Import uvicorn here to avoid issues if not installed
    try:
        import uvicorn
    except ImportError:
        print("Error: uvicorn is not installed.")
        print("Run: pip install uvicorn")
        sys.exit(1)
    
    print(f"""
================================================================
                    MemoryBook Backend                        
================================================================
  Starting server at: http://{args.host}:{args.port}
  API Documentation:  http://{args.host}:{args.port}/docs
  Health Check:       http://{args.host}:{args.port}/health
                                                              
  Press Ctrl+C to stop                                        
================================================================
    """)
    
    # Run the server
    uvicorn.run(
        "app:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="debug" if args.debug else "info"
    )


if __name__ == "__main__":
    main()
