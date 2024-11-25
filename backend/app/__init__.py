from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from azure.cosmos import CosmosClient, PartitionKey
from datetime import timedelta
import os
from dotenv import load_dotenv
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables from root directory
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(root_dir, '.env'))

def init_cosmos_db():
    """Initialize Cosmos DB connection with detailed logging"""
    try:
        cosmos_endpoint = os.getenv('COSMOS_ENDPOINT')
        cosmos_key = os.getenv('COSMOS_KEY')
        
        logger.info(f"Attempting to connect to Cosmos DB at endpoint: {cosmos_endpoint}")
        
        if not cosmos_endpoint or not cosmos_key:
            raise ValueError("Missing required environment variables: COSMOS_ENDPOINT or COSMOS_KEY")
        
        cosmos_client = CosmosClient(
            cosmos_endpoint,
            cosmos_key
        )
        logger.info("Successfully created Cosmos Client")
        
        # Get or create database
        database = cosmos_client.create_database_if_not_exists('tribez')
        logger.info("Successfully connected to database 'tribez'")

        # Get or create containers with throughput
        containers_config = [
            ('users', '/id'),
            ('tribes', '/id'),
            ('tribe_members', '/id')
        ]

        containers = {}
        for container_id, partition_key in containers_config:
            logger.info(f"Creating/accessing container '{container_id}'")
            container = database.create_container_if_not_exists(
                id=container_id,
                partition_key=PartitionKey(path=partition_key),
                offer_throughput=400
            )
            containers[container_id] = container
            logger.info(f"Successfully created/accessed container '{container_id}'")

        return database, containers

    except Exception as e:
        logger.error(f"Error initializing Cosmos DB: {str(e)}")
        raise

def create_app():
    app = Flask(__name__)
    
    # Configure Flask app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

    try:
        # Initialize Cosmos DB
        logger.info("Initializing Cosmos DB connection...")
        database, containers = init_cosmos_db()
        
        # Make database and containers available to routes
        app.database = database
        app.containers = containers
        logger.info("Successfully initialized Cosmos DB and attached to Flask app")

    except Exception as e:
        logger.error(f"Failed to initialize app: {str(e)}")
        raise

    # Initialize extensions
    CORS(app)
    JWTManager(app)

    # Import and register blueprints
    from app.routes import main
    app.register_blueprint(main)

    return app
