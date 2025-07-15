import { TransportService } from '../../src/services/transport.service';
import { transportModel } from '../../src/repositories/transport.repository';
import { postModel } from '../../src/repositories/post.repository';
import { Transport, UpdateTransportRequest } from '../../src/interfaces/transport.interface';

jest.mock('../../src/repositories/transport.repository');
jest.mock('../../src/repositories/post.repository');

describe('TransportService.updateTransport', () => {
  const mockTransport: Transport = {
    id: 'transport1',
    post_id: 'post1',
    transport_type: 'bus',
    provider: 'ProviderA',
    cost: 100,
    notes: 'Initial notes',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPost = {
    id: 'post1',
    user_id: 'user1',
  };

  const updatedTransport: Transport = {
    ...mockTransport,
    transport_type: 'train',
    provider: 'ProviderB',
    cost: 200,
    notes: 'Updated notes',
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update and return the transport when found', async () => {
    (transportModel.findById as jest.Mock)
      .mockResolvedValueOnce(mockTransport) // findById before update
      .mockResolvedValueOnce(updatedTransport); // findById after update

    (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
    (transportModel.update as jest.Mock).mockResolvedValue(undefined);

    const updateData: UpdateTransportRequest = {
      transport_type: 'train',
      provider: 'ProviderB',
      cost: 200,
      notes: 'Updated notes',
    };

    const result = await TransportService.updateTransport('transport1', updateData);

    expect(transportModel.findById).toHaveBeenCalledWith('transport1');
    expect(postModel.findById).toHaveBeenCalledWith('post1');
    expect(transportModel.update).toHaveBeenCalledWith('transport1', updateData);
    expect(result).toEqual(updatedTransport);
  });

  it('should return null if transport does not exist', async () => {
    (transportModel.findById as jest.Mock).mockResolvedValue(null);

    const updateData: UpdateTransportRequest = { provider: 'ProviderB' };
    const result = await TransportService.updateTransport('nonexistent', updateData);

    expect(transportModel.findById).toHaveBeenCalledWith('nonexistent');
    expect(result).toBeNull();
    expect(postModel.findById).not.toHaveBeenCalled();
    expect(transportModel.update).not.toHaveBeenCalled();
  });

  it('should return updated transport even if updateData is partial', async () => {
    (transportModel.findById as jest.Mock)
      .mockResolvedValueOnce(mockTransport)
      .mockResolvedValueOnce({ ...mockTransport, provider: 'ProviderC' });

    (postModel.findById as jest.Mock).mockResolvedValue(mockPost);
    (transportModel.update as jest.Mock).mockResolvedValue(undefined);

    const updateData: UpdateTransportRequest = { provider: 'ProviderC' };

    const result = await TransportService.updateTransport('transport1', updateData);

    expect(transportModel.update).toHaveBeenCalledWith('transport1', updateData);
    expect(result).toEqual({ ...mockTransport, provider: 'ProviderC' });
  });
});