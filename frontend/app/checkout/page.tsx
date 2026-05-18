export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-muted/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-xl border shadow-sm text-center">
        <h2 className="text-2xl font-bold mb-2">Claim Leakage Audit</h2>
        <p className="text-muted-foreground mb-6">Secure Checkout via Stripe</p>
        
        <div className="bg-muted p-4 rounded-lg mb-6 text-left">
          <div className="flex justify-between font-medium mb-2">
            <span>One-Time Audit Fee</span>
            <span>$1,500.00</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Includes full analysis of up to 5,000 claims, ROI estimate, and prioritized recovery actions.
          </p>
        </div>

        <button className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition shadow-md">
          Proceed to Payment
        </button>
        <p className="text-xs text-muted-foreground mt-4">
          By proceeding, you agree to our terms of service and BAA.
        </p>
      </div>
    </div>
  );
}
