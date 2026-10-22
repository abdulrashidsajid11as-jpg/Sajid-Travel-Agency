-- Travel Agency Access Queries v27
-- Run these as saved queries in Microsoft Access after importing tables.

CREATE INDEX ixCustomersPhone ON Customers (Phone);
CREATE INDEX ixCustomersName ON Customers (FullName);
CREATE INDEX ixTicketsCustomerDate ON Tickets (CustomerID, TravelDate);
CREATE INDEX ixTicketsPNR ON Tickets (PNR);
CREATE INDEX ixVisasCustomerDate ON Visas (CustomerID, ApplicationDate);
CREATE INDEX ixPaymentsCustomerDate ON Payments (CustomerID, PaymentDate);

-- Customer statement
SELECT c.CustomerID,c.CustomerCode,c.FullName, t.TravelDate AS TxnDate, 'Ticket' AS TxnType, t.TicketNo AS RefNo, t.Price AS Debit, 0 AS Credit, cur.CurrencyCode
FROM (Customers AS c INNER JOIN Tickets AS t ON c.CustomerID=t.CustomerID) LEFT JOIN Currencies AS cur ON t.CurrencyID=cur.CurrencyID
UNION ALL
SELECT c.CustomerID,c.CustomerCode,c.FullName,p.PaymentDate,'Payment',CStr(p.PaymentID),0,p.Amount,cur.CurrencyCode
FROM (Customers AS c INNER JOIN Payments AS p ON c.CustomerID=p.CustomerID) LEFT JOIN Currencies AS cur ON p.CurrencyID=cur.CurrencyID;

-- Daily payments
SELECT PaymentDate, CurrencyID, Sum(Amount) AS TotalAmount, Count(*) AS PaymentCount
FROM Payments GROUP BY PaymentDate, CurrencyID ORDER BY PaymentDate DESC;

-- Customer balance summary
SELECT c.CustomerID,c.CustomerCode,c.FullName, Nz(t.DebitTotal,0)-Nz(p.CreditTotal,0) AS Balance
FROM (Customers AS c LEFT JOIN (SELECT CustomerID,Sum(Price) AS DebitTotal FROM Tickets GROUP BY CustomerID) AS t ON c.CustomerID=t.CustomerID)
LEFT JOIN (SELECT CustomerID,Sum(Amount) AS CreditTotal FROM Payments GROUP BY CustomerID) AS p ON c.CustomerID=p.CustomerID;
