from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import boto3
import uuid
import tempfile
import json
import os
from datetime import datetime
from boto3.dynamodb.conditions import Attr

import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

dynamodb = boto3.resource(
    'dynamodb',
    region_name='ap-south-1', 
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

transactions_table = dynamodb.Table('Transactions')
users_table = dynamodb.Table('Users')

@app.route('/api/transactions', methods=['GET', 'POST'])
def handle_transactions():
    if request.method == 'GET':
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify([])

        try:
            response = transactions_table.scan(
                FilterExpression=Attr('userId').eq(user_id)
            )
            items = response.get('Items', [])
            for item in items:
                item['amount'] = float(item.get('amount', 0))
            return jsonify(items)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    if request.method == 'POST':
        try:
            data = request.json
            new_id = str(uuid.uuid4()) 
            transaction_item = {
                'id': new_id,
                'userId': data.get('userId'),
                'name': data.get('name', 'Manual Entry'),
                'amount': str(data.get('amount', 0)), 
                'category': data.get('category', 'Other'),
                'date': datetime.now().strftime('%b %d, %Y')
            }
            transactions_table.put_item(Item=transaction_item)
            transaction_item['amount'] = float(transaction_item['amount'])
            return jsonify({"message": "Transaction added successfully!", "transaction": transaction_item}), 201
        except Exception as e:
            return jsonify({"error": "Failed to save to AWS"}), 500
        
@app.route('/api/transactions/all', methods=['DELETE'])
def delete_all_transactions():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "No user ID provided"}), 400
        
    try:
        response = transactions_table.scan(FilterExpression=Attr('userId').eq(user_id))
        items = response.get('Items', [])
        with transactions_table.batch_writer() as batch:
            for item in items:
                batch.delete_item(Key={'id': item['id']})               
        return jsonify({"message": "Vault cleared successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/transactions/<transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        transactions_table.delete_item(Key={'id': transaction_id})
        return jsonify({"message": "Transaction deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to delete from database"}), 500

@app.route('/api/settings', methods=['GET', 'POST'])
def handle_settings():
    if request.method == 'GET':
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({"error": "No user ID provided"}), 400
        try:
            response = users_table.get_item(Key={'userId': user_id})
            return jsonify(response.get('Item', {}))
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    if request.method == 'POST':
        data = request.json
        try:
            item = {
                'userId': data.get('userId'),
                'currency': data.get('currency', 'INR'),
                'monthlyBudget': str(data.get('monthlyBudget', 0)),
                'theme': data.get('theme', 'dark'),
                'language': data.get('language', 'English'),
                'notifications': data.get('notifications', 'email')
            }
            users_table.put_item(Item=item)
            return jsonify({"message": "Settings locked in!"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    try:
        user_message = data.get("message", "")
        user_id = data.get("userId")
        history = data.get("history", []) 

        if user_id:
            response = transactions_table.scan(FilterExpression=Attr('userId').eq(user_id))
            transactions = response.get('Items', [])
        else:
            transactions = []
        raw_currency = str(data.get('currency_code', data.get('currency', 'inr'))).lower()
        
        symbol_map = {
            "usd": "$",
            "eur": "€",
            "inr": "₹",
            "gbp": "£",
            "$": "$",
            "€": "€",
            "₹": "₹",
            "£": "£"
        }
        currency_symbol = symbol_map.get(raw_currency, raw_currency)
        total_balance = 0
        total_expenses = 0
        recent_txs = []
        category_spending = {}
        
        for tx in transactions:
            amt = float(tx.get('amount', 0))
            cat = str(tx.get('category', '')).lower()
            
            if cat in ['salary', 'income']:
                total_balance += amt
            elif cat not in ['savings', 'investment', 'savings_external', 'savings_internal']:
                total_expenses += abs(amt)
                total_balance -= abs(amt)
                category_spending[cat] = category_spending.get(cat, 0) + abs(amt)
        category_str = ", ".join([f"{k.capitalize()}: {currency_symbol}{v}" for k, v in category_spending.items()]) if category_spending else "No categorized expenses."

        sorted_txs = sorted(transactions, key=lambda x: str(x.get('date', '')), reverse=True)[:5]
        for tx in sorted_txs:
            recent_txs.append(f"{tx.get('name')} ({currency_symbol}{tx.get('amount')})")
            
        recent_tx_str = ", ".join(recent_txs) if recent_txs else "No recent transactions"
        current_datetime = datetime.now().strftime('%B %d, %Y at %I:%M %p')
        
        system_context = f"""
        You are AuraVault AI, an elite wealth architect and behavioral finance expert. 
        You possess the analytical rigor of a top-tier hedge fund manager. You do not just track money; you engineer financial freedom. Your tone is direct, highly confident, strictly concise, and professional.

        LIVE TELEMETRY DATA:
        - Current Date & Time: {current_datetime}
        - Liquidity (Balance): {currency_symbol}{total_balance}
        - Burn Rate (Total Expenses): {currency_symbol}{total_expenses}
        - Categorized Spending: {category_str} 
        - Cash Flow Velocity (Recent): {recent_tx_str}

        COGNITIVE FRAMEWORK & OPERATING RULES:
        1. THE ICEBREAKER PROTOCOL: If the user simply greets you (e.g., "hi", "hello"), reply with ONE short sentence acknowledging their Liquidity, and ask what they want to work on.
        2. THE GENERAL INQUIRY PROTOCOL (STRICT OVERRIDE): If the user asks a simple, factual, or non-financial question, answer it directly and concisely. DO NOT force a financial analysis.
        3. THE AUDITOR PROTOCOL: If the user asks about specific spending, look specifically at the 'Categorized Spending' data and give them the exact numbers.
        4. ZERO-WASTE COMMUNICATION: Maximum 3 short paragraphs. NO generic AI intros.
        5. BOLD THE BAG: Financial figures must always be bolded with the correct currency symbol (e.g., **{currency_symbol}27,770**). 
        """
        
        model = genai.GenerativeModel('gemini-3.5-flash', system_instruction=system_context)
        
        formatted_history = []
        for msg in history:
            role = "model" if msg["role"] == "ai" else "user"
            formatted_history.append({"role": role, "parts": [msg["content"]]})
            
        while len(formatted_history) > 0 and formatted_history[0]["role"] == "model":
            formatted_history.pop(0)
            
        chat_session = model.start_chat(history=formatted_history)
        ai_response = chat_session.send_message(user_message)
        
        return jsonify({"reply": ai_response.text}), 200
        
    except Exception as e:
        return jsonify({"reply": f"API Error: {str(e)}"}), 500
@app.route('/api/upload', methods=['POST'])
def upload_statement():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    user_id = request.form.get('userId')
    
    if not user_id or file.filename == '':
        return jsonify({"error": "Missing user ID or file"}), 400

    try:
        temp_dir = tempfile.gettempdir()
        filepath = os.path.join(temp_dir, file.filename)
        file.save(filepath)
        gemini_file = genai.upload_file(path=filepath)
        model = genai.GenerativeModel('gemini-3.5-flash')
        prompt = """
        Analyze this financial document (bank statement, receipt, or invoice). 
        Extract all transactions.
        Return exactly a raw JSON array of objects. Do not wrap it in ```json blocks. Just raw JSON.
        Keys required for each object:
        - "name": Merchant or description
        - "amount": Absolute numeric value as a string (e.g., "45.50")
        - "category": Choose the best fit: Salary, Housing, Education, Food, Travel, Entertainment, Shopping, Utilities, Health, Savings, Other.
        - "date": Format exactly like "Jun 06, 2026". If no year is visible, assume the current year.
        """
        response = model.generate_content([gemini_file, prompt])
        response_text = response.text.replace('```json', '').replace('```', '').strip()
        extracted_txs = json.loads(response_text)
        added_txs = []
        with transactions_table.batch_writer() as batch:
            for tx in extracted_txs:
                new_id = str(uuid.uuid4())
                item = {
                    'id': new_id,
                    'userId': user_id,
                    'name': str(tx.get('name', 'Unknown')),
                    'amount': str(tx.get('amount', '0')),
                    'category': str(tx.get('category', 'Other')),
                    'date': str(tx.get('date', datetime.now().strftime('%b %d, %Y')))
                }
                batch.put_item(Item=item)
                added_txs.append(item)
        
        # 6. Clean up: Delete file from Gemini servers and your local temp folder
        genai.delete_file(gemini_file.name)
        os.remove(filepath)
        
        return jsonify({"message": "Successfully processed with AI", "count": len(added_txs)}), 200

    except Exception as e:
        print("AI Upload Error:", str(e))
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)