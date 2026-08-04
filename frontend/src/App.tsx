import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { getQuote, updateQuote } from './api/quotes';
import type {
  Discount,
  LineItem,
  Quote,
  Section,
} from './types/quote';

interface DemoUser {
  id: string;
  name: string;
  organizationId: string;
  quoteId: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-a1',
    name: 'Alice',
    organizationId: 'org-a',
    quoteId: 'quote-a1',
  },
  {
    id: 'user-a2',
    name: 'Aaron',
    organizationId: 'org-a',
    quoteId: 'quote-a1',
  },
  {
    id: 'user-b1',
    name: 'Bob',
    organizationId: 'org-b',
    quoteId: 'quote-b1',
  },
];

function calculatePreview(quote: Quote) {
  const quoteSubtotalCents = quote.sections.reduce(
    (quoteTotal, section) => {
      const sectionSubtotal = section.lineItems.reduce(
        (lineTotal, item) =>
          lineTotal +
          Math.round(item.quantity * item.unitPriceCents),
        0,
      );

      const markupAmount = Math.round(
        sectionSubtotal *
          ((section.markupPercentage ?? 0) / 100),
      );

      return quoteTotal + sectionSubtotal + markupAmount;
    },
    0,
  );

  let discountAmountCents = 0;

  if (quote.discount?.type === 'percentage') {
    discountAmountCents = Math.round(
      quoteSubtotalCents *
        (quote.discount.value / 100),
    );
  }

  if (quote.discount?.type === 'fixed') {
    discountAmountCents = quote.discount.valueCents;
  }

  discountAmountCents = Math.min(
    quoteSubtotalCents,
    Math.max(0, discountAmountCents),
  );

  const taxableAmountCents =
    quoteSubtotalCents - discountAmountCents;

  const taxAmountCents = Math.round(
    taxableAmountCents * (quote.taxRate / 100),
  );

  return {
    quoteSubtotalCents,
    discountAmountCents,
    taxableAmountCents,
    taxAmountCents,
    totalCents: taxableAmountCents + taxAmountCents,
  };
}

function formatMoney(valueCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(valueCents / 100);
}

function App() {
  const [selectedUserId, setSelectedUserId] =
    useState('user-a1');
  const [quote, setQuote] =
    useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const selectedUser =
    DEMO_USERS.find(
      (user) => user.id === selectedUserId,
    ) ?? DEMO_USERS[0];

  useEffect(() => {
    async function loadQuote() {
      setLoading(true);
      setQuote(null);
      setMessage('');

      try {
        const result = await getQuote(
          selectedUser.quoteId,
          selectedUser.id,
        );

        setQuote(result);
      } catch {
        setMessage(
          'Unable to load quote for the selected tenant.',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadQuote();
  }, [selectedUser.id, selectedUser.quoteId]);

  const previewTotals = useMemo(() => {
    if (!quote) {
      return null;
    }

    return calculatePreview(quote);
  }, [quote]);

  function updateSection(
    sectionId: string,
    changes: Partial<Section>,
  ) {
    setQuote((currentQuote) => {
      if (!currentQuote) {
        return currentQuote;
      }

      return {
        ...currentQuote,
        sections: currentQuote.sections.map(
          (section) =>
            section.id === sectionId
              ? { ...section, ...changes }
              : section,
        ),
      };
    });
  }

  function updateLineItem(
    sectionId: string,
    itemId: string,
    changes: Partial<LineItem>,
  ) {
    setQuote((currentQuote) => {
      if (!currentQuote) {
        return currentQuote;
      }

      return {
        ...currentQuote,
        sections: currentQuote.sections.map(
          (section) =>
            section.id === sectionId
              ? {
                  ...section,
                  lineItems: section.lineItems.map(
                    (item) =>
                      item.id === itemId
                        ? { ...item, ...changes }
                        : item,
                  ),
                }
              : section,
        ),
      };
    });
  }

  function addLineItem(sectionId: string) {
    setQuote((currentQuote) => {
      if (!currentQuote) {
        return currentQuote;
      }

      const newItem: LineItem = {
        id: `item-${Date.now()}`,
        description: 'New item',
        quantity: 1,
        unitPriceCents: 0,
      };

      return {
        ...currentQuote,
        sections: currentQuote.sections.map(
          (section) =>
            section.id === sectionId
              ? {
                  ...section,
                  lineItems: [
                    ...section.lineItems,
                    newItem,
                  ],
                }
              : section,
        ),
      };
    });
  }

  function removeLineItem(
    sectionId: string,
    itemId: string,
  ) {
    setQuote((currentQuote) => {
      if (!currentQuote) {
        return currentQuote;
      }

      return {
        ...currentQuote,
        sections: currentQuote.sections.map(
          (section) =>
            section.id === sectionId
              ? {
                  ...section,
                  lineItems:
                    section.lineItems.filter(
                      (item) => item.id !== itemId,
                    ),
                }
              : section,
        ),
      };
    });
  }

  function changeDiscountType(
    type: 'none' | Discount['type'],
  ) {
    if (!quote) {
      return;
    }

    if (type === 'none') {
      setQuote({
        ...quote,
        discount: undefined,
      });

      return;
    }

    if (type === 'percentage') {
      setQuote({
        ...quote,
        discount: {
          type: 'percentage',
          value: 0,
        },
      });

      return;
    }

    setQuote({
      ...quote,
      discount: {
        type: 'fixed',
        valueCents: 0,
      },
    });
  }

  function updateDiscountValue(value: number) {
    if (!quote?.discount) {
      return;
    }

    if (quote.discount.type === 'percentage') {
      setQuote({
        ...quote,
        discount: {
          type: 'percentage',
          value: Math.max(0, value),
        },
      });

      return;
    }

    setQuote({
      ...quote,
      discount: {
        type: 'fixed',
        valueCents: Math.max(
          0,
          Math.round(value * 100),
        ),
      },
    });
  }

  async function handleSave() {
    if (!quote) {
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const savedQuote = await updateQuote(
        quote,
        selectedUser.id,
      );

      setQuote(savedQuote);
      setMessage('Quote saved successfully.');
    } catch {
      setMessage('Unable to save quote.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            Multi-Tenant Quote Builder
          </p>

          <h1>Edit Quote</h1>

          <p className="tenant-label">
            Selected tenant:{' '}
            {selectedUser.organizationId}
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => void handleSave()}
          disabled={saving || loading || !quote}
        >
          {saving ? 'Saving...' : 'Save Quote'}
        </button>
      </header>

      <section className="card">
        <h2>Tenant demonstration</h2>

        <div className="form-grid">
          <label>
            Acting user
            <select
              value={selectedUserId}
              onChange={(event) =>
                setSelectedUserId(event.target.value)
              }
            >
              {DEMO_USERS.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.name} — {user.organizationId}
                </option>
              ))}
            </select>
          </label>

          <label>
            Organization
            <input
              value={selectedUser.organizationId}
              readOnly
            />
          </label>

          <label>
            Accessible quote
            <input
              value={selectedUser.quoteId}
              readOnly
            />
          </label>
        </div>

        <p className="tenant-label">
          The selected user can load only quotes from
          their own organization.
        </p>
      </section>

      {message && (
        <p className="message">{message}</p>
      )}

      {loading && (
        <section className="card">
          Loading quote...
        </section>
      )}

      {!loading && quote && previewTotals && (
        <>
          <section className="card">
            <h2>Quote details</h2>

            <div className="form-grid">
              <label>
                Customer name
                <input
                  value={quote.customerName}
                  onChange={(event) =>
                    setQuote({
                      ...quote,
                      customerName:
                        event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Status
                <select
                  value={quote.status}
                  onChange={(event) =>
                    setQuote({
                      ...quote,
                      status:
                        event.target
                          .value as Quote['status'],
                    })
                  }
                >
                  <option value="draft">
                    Draft
                  </option>
                  <option value="sent">
                    Sent
                  </option>
                  <option value="accepted">
                    Accepted
                  </option>
                </select>
              </label>

              <label>
                Tax rate %
                <input
                  type="number"
                  min="0"
                  value={quote.taxRate}
                  onChange={(event) =>
                    setQuote({
                      ...quote,
                      taxRate: Number(
                        event.target.value,
                      ),
                    })
                  }
                />
              </label>
            </div>
          </section>

          <section className="card">
            <h2>Discount</h2>

            <div className="form-grid">
              <label>
                Discount type
                <select
                  value={
                    quote.discount?.type ?? 'none'
                  }
                  onChange={(event) =>
                    changeDiscountType(
                      event.target.value as
                        | 'none'
                        | Discount['type'],
                    )
                  }
                >
                  <option value="none">
                    No discount
                  </option>
                  <option value="percentage">
                    Percentage
                  </option>
                  <option value="fixed">
                    Fixed amount
                  </option>
                </select>
              </label>

              {quote.discount?.type ===
                'percentage' && (
                <label>
                  Discount %
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quote.discount.value}
                    onChange={(event) =>
                      updateDiscountValue(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                  />
                </label>
              )}

              {quote.discount?.type ===
                'fixed' && (
                <label>
                  Discount amount $
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      quote.discount
                        .valueCents / 100
                    }
                    onChange={(event) =>
                      updateDiscountValue(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                  />
                </label>
              )}
            </div>
          </section>

          {quote.sections.map((section) => (
            <section
              className="card"
              key={section.id}
            >
              <div className="section-heading">
                <input
                  className="section-name"
                  value={section.name}
                  onChange={(event) =>
                    updateSection(section.id, {
                      name: event.target.value,
                    })
                  }
                />

                <label>
                  Markup %
                  <input
                    type="number"
                    min="0"
                    value={
                      section.markupPercentage ??
                      0
                    }
                    onChange={(event) =>
                      updateSection(section.id, {
                        markupPercentage:
                          Number(
                            event.target.value,
                          ),
                      })
                    }
                  />
                </label>
              </div>

              <div className="line-items">
                {section.lineItems.map((item) => (
                  <div
                    className="line-item"
                    key={item.id}
                  >
                    <input
                      value={item.description}
                      aria-label="Description"
                      onChange={(event) =>
                        updateLineItem(
                          section.id,
                          item.id,
                          {
                            description:
                              event.target.value,
                          },
                        )
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      aria-label="Quantity"
                      onChange={(event) =>
                        updateLineItem(
                          section.id,
                          item.id,
                          {
                            quantity: Number(
                              event.target.value,
                            ),
                          },
                        )
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        item.unitPriceCents / 100
                      }
                      aria-label="Unit price"
                      onChange={(event) =>
                        updateLineItem(
                          section.id,
                          item.id,
                          {
                            unitPriceCents:
                              Math.round(
                                Number(
                                  event.target.value,
                                ) * 100,
                              ),
                          },
                        )
                      }
                    />

                    <strong>
                      {formatMoney(
                        item.quantity *
                          item.unitPriceCents,
                      )}
                    </strong>

                    <button
                      className="danger-button"
                      onClick={() =>
                        removeLineItem(
                          section.id,
                          item.id,
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="secondary-button"
                onClick={() =>
                  addLineItem(section.id)
                }
              >
                Add line item
              </button>
            </section>
          ))}

          <section className="card totals-card">
            <h2>Live preview</h2>

            <div className="total-row">
              <span>Subtotal</span>
              <strong>
                {formatMoney(
                  previewTotals
                    .quoteSubtotalCents,
                )}
              </strong>
            </div>

            <div className="total-row">
              <span>Discount</span>
              <strong>
                -
                {formatMoney(
                  previewTotals
                    .discountAmountCents,
                )}
              </strong>
            </div>

            <div className="total-row">
              <span>Taxable amount</span>
              <strong>
                {formatMoney(
                  previewTotals
                    .taxableAmountCents,
                )}
              </strong>
            </div>

            <div className="total-row">
              <span>Tax</span>
              <strong>
                {formatMoney(
                  previewTotals.taxAmountCents,
                )}
              </strong>
            </div>

            <div className="total-row grand-total">
              <span>Total</span>
              <strong>
                {formatMoney(
                  previewTotals.totalCents,
                )}
              </strong>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default App;