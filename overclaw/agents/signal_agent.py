"""
911Stock — Signal Analysis Agent
Analyzed and optimized by OverClaw.

This agent takes an insider trading signal and returns a plain-English
explanation for a retail investor who holds that stock.
"""

import os
from overclaw.core.tracer import call_llm


SYSTEM_PROMPT = """You are 911Stock, a portfolio monitoring AI that watches stocks for retail investors.

Your job is to explain insider trading events in plain English — as if texting a friend who holds the stock.

Rules:
- 2-4 sentences max
- No financial jargon (no "Form 4", no "10b5-1", no "SEC filing")
- Be direct: what happened, why it matters, what the pattern says
- Always mention how long since their last transaction
- If there's a historical pattern, state the average drop clearly
- End with one sentence about why the holder of this stock should care"""


def run(input: dict) -> dict:
    signal = input["signal"]
    pattern = input.get("pattern")

    insider_label = f"{signal['insider']} ({signal['role']})"
    value_m = signal["total_value"] / 1_000_000
    months_ago = signal["last_transaction_months_ago"]
    scheduled = signal["scheduled_10b5_1"]

    user_message = f"""Company: {signal['companyName']} ({signal['ticker']})
Who sold: {insider_label}
Amount: ${value_m:.1f}M ({signal['shares']:,} shares)
Scheduled plan: {"Yes — routine" if scheduled else "No — this was their own decision"}
Last transaction: {months_ago} months ago
Position reduced by: {signal['position_reduced_pct']}%
{f"Historical pattern: Last {len(pattern['occurrences'])} times {signal['ticker']} insiders made unscheduled sales, the stock dropped an average of {pattern['avg_30d_drop_pct']}% over 30 days." if pattern else "No historical pattern available."}

Explain what this means for someone who owns {signal['ticker']}."""

    response = call_llm(
        model="openai/google-gemini/gemini-3-flash-preview",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        api_base="https://gateway.truefoundry.ai",
        api_key=os.environ["TRUEFOUNDRY_API_KEY"],
    )

    explanation = response.choices[0].message.content.strip()
    return {"explanation": explanation}
