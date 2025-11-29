"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentSettings() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Saved Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary">
            Online card storage and payment processing have been removed from
            this project. Your existing bookings remain intact, but new card
            details can no longer be added or managed from this dashboard.
          </p>
          <p className="mt-3 text-sm text-secondary">
            Need to update a payment method? Please contact our support team so
            we can assist you manually.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm text-muted-foreground">
            You can download your payment history below.
          </p>
          <Button variant="outline">Download PDF</Button>
        </CardContent>
      </Card>
    </div>
  );
}
