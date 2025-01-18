import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WishItem from '../WishItem';

const mockProps = {
  id: 1,
  item: 'Test Item',
  description: 'Test Description',
  link: 'https://example.com',
  reservedBy: null,
  bought: false,
  boughtAt: null,
  onReserve: vi.fn(),
  onMarkAsBought: vi.fn(),
  currentUserEmail: null,
};

describe('WishItem', () => {
  it('renders item details correctly', () => {
    render(<WishItem {...mockProps} />);
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('shows reserve button when not reserved', () => {
    render(<WishItem {...mockProps} />);
    
    const reserveButton = screen.getByRole('button', { name: /reserve/i });
    expect(reserveButton).toBeInTheDocument();
  });

  it('shows reserved status when item is reserved', () => {
    render(
      <WishItem
        {...mockProps}
        reservedBy="test@example.com"
      />
    );
    
    expect(screen.getByText(/reserved by test@example.com/i)).toBeInTheDocument();
  });

  it('shows bought status with date when item is purchased', () => {
    const boughtDate = '2024-03-25T12:00:00Z';
    render(
      <WishItem
        {...mockProps}
        reservedBy="buyer@example.com"
        bought={true}
        boughtAt={boughtDate}
      />
    );

    expect(screen.getByText(/bought by buyer@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/bought on/i)).toBeInTheDocument();
  });

  it('allows marking as bought when reserved by current user', async () => {
    const user = userEvent.setup();
    
    render(
      <WishItem
        {...mockProps}
        reservedBy="user@example.com"
        currentUserEmail="user@example.com"
      />
    );
    
    const markAsBoughtButton = screen.getByRole('button', { name: /mark as bought/i });
    await user.click(markAsBoughtButton);
    
    expect(mockProps.onMarkAsBought).toHaveBeenCalled();
  });
});