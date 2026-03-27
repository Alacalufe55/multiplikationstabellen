import tkinter as tk
import random

root = tk.Tk()
root.title("Multiplikationstest")

poäng = 0

num1 = random.randint(1, 10)
num2 = random.randint(1, 10)

def kontrollera():
    global num1, num2, poäng
    
    try:
        svar = int(entry.get())
        
        if svar == num1 * num2:
            poäng += 1
            resultat_label.config(text="Rätt! 🎉")
        else:
            resultat_label.config(text=f"Fel! Rätt svar är {num1 * num2}")
        
        poäng_label.config(text=f"Poäng: {poäng}")
        
        num1 = random.randint(1, 10)
        num2 = random.randint(1, 10)
        fråga_label.config(text=f"{num1} × {num2} = ?")
        
        entry.delete(0, tk.END)
        
    except:
        resultat_label.config(text="Skriv en siffra!")

fråga_label = tk.Label(root, text=f"{num1} × {num2} = ?", font=("Arial", 16))
fråga_label.pack(pady=10)

entry = tk.Entry(root)
entry.pack()

knapp = tk.Button(root, text="Svara", command=kontrollera)
knapp.pack(pady=10)

resultat_label = tk.Label(root, text="")
resultat_label.pack()

poäng_label = tk.Label(root, text="Poäng: 0")
poäng_label.pack()

root.mainloop()