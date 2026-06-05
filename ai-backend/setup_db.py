import boto3
import os
from dotenv import load_dotenv
load_dotenv()

dynamodb = boto3.resource(
    'dynamodb',
    region_name='ap-south-1',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

def create_tables():
    try:
        table = dynamodb.create_table(
            TableName='Transactions',
            KeySchema=[{'AttributeName': 'id', 'KeyType': 'HASH'}],
            AttributeDefinitions=[{'AttributeName': 'id', 'AttributeType': 'S'}],
            BillingMode='PAY_PER_REQUEST'
        )
        table.meta.client.get_waiter('table_exists').wait(TableName='Transactions')
        print("Transactions table is online!")
    except Exception as e:
        print("Transactions table already exists.")

    try:
        print("Waiting for AWS to build the Users table...")
        users_table = dynamodb.create_table(
            TableName='Users',
            KeySchema=[{'AttributeName': 'userId', 'KeyType': 'HASH'}],
            AttributeDefinitions=[{'AttributeName': 'userId', 'AttributeType': 'S'}],
            BillingMode='PAY_PER_REQUEST'
        )
        users_table.meta.client.get_waiter('table_exists').wait(TableName='Users')
        print("Success! Users table is online!")
    except Exception as e:
        print("Users table already exists.")

if __name__ == '__main__':
    create_tables()