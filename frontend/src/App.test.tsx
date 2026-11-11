import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('Vow & Veil landing page', () => {
  it('renders the homepage headline', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    expect(screen.getByText(/A beautiful beginning deserves a beautifully planned celebration/i)).toBeInTheDocument();
  });
});
