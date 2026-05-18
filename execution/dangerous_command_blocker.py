import os
import sys

def check_command_safety(command: str) -> bool:
    """
    Checks if a command is safe to run.
    Blocks dangerous commands.
    """
    dangerous_keywords = [
        "rm -rf /",
        "rm -rf *",
        "drop table",
        "truncate table",
        "aws configure",
        "chmod 777",
        "chown -R",
        "> /etc/",
        "mkfs",
        "dd if="
    ]
    
    command_lower = command.lower()
    for keyword in dangerous_keywords:
        if keyword in command_lower:
            return False
            
    # Additional checks for exfiltrating secrets, bypassing limits etc.
    if "curl" in command_lower and ".env" in command_lower:
        return False
        
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if check_command_safety(cmd):
            print("SAFE")
            sys.exit(0)
        else:
            print("DANGEROUS: Command blocked.")
            sys.exit(1)
