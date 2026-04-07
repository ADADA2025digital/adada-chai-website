/**
 * Calculate delivery charge based on total weight and delivery type
 * @param {number} totalWeight - Total weight in grams
 * @param {string} deliveryType - 'standard' or 'express'
 * @param {Array} deliveryOptions - Array of delivery options from API
 * @returns {number} - Delivery charge amount
 */
export const calculateDeliveryChargeFromAPI = (totalWeight, deliveryType, deliveryOptions) => {
  if (!deliveryOptions || deliveryOptions.length === 0) return 0;
  if (totalWeight <= 0) return 0;

  // Filter options by delivery type (based on title)
  const typeOptions = deliveryOptions.filter(option => 
    option.delivery_title?.toLowerCase().includes(deliveryType.toLowerCase())
  );

  if (typeOptions.length === 0) return 0;

  // Find applicable option based on weight range
  // Assumes the API returns options with min_weight and max_weight fields
  const applicableOption = typeOptions.find(option => {
    const minWeight = option.min_weight || 0;
    const maxWeight = option.max_weight || Infinity;
    return totalWeight >= minWeight && totalWeight < maxWeight;
  });

  // If no exact match found, use the highest weight tier
  if (!applicableOption && typeOptions.length > 0) {
    // Sort by max_weight descending and take the first
    const sortedOptions = [...typeOptions].sort((a, b) => 
      (b.max_weight || Infinity) - (a.max_weight || Infinity)
    );
    return parseFloat(sortedOptions[0].delivery_price || 0);
  }

  return applicableOption ? parseFloat(applicableOption.delivery_price || 0) : 0;
};

/**
 * Format delivery options for display
 * @param {Array} deliveryOptions - Raw delivery options from API
 * @returns {Object} - Formatted options grouped by type
 */
export const formatDeliveryOptions = (deliveryOptions) => {
  if (!deliveryOptions || deliveryOptions.length === 0) {
    return { standard: [], express: [] };
  }

  const standard = [];
  const express = [];

  deliveryOptions.forEach(option => {
    const formattedOption = {
      id: option.option_id || option.id,
      title: option.delivery_title,
      price: parseFloat(option.delivery_price || 0),
      description: option.deleivery_description || option.description,
      minWeight: option.min_weight || 0,
      maxWeight: option.max_weight || Infinity,
      estimatedDays: option.estimated_days || null,
    };

    if (option.delivery_title?.toLowerCase().includes('express')) {
      express.push(formattedOption);
    } else {
      standard.push(formattedOption);
    }
  });

  // Sort by minWeight
  standard.sort((a, b) => a.minWeight - b.minWeight);
  express.sort((a, b) => a.minWeight - b.minWeight);

  return { standard, express };
};

/**
 * Get delivery option description for a given weight
 * @param {number} totalWeight - Total weight in grams
 * @param {string} deliveryType - 'standard' or 'express'
 * @param {Array} deliveryOptions - Formatted delivery options
 * @returns {string} - Description text
 */
export const getDeliveryDescription = (totalWeight, deliveryType, deliveryOptions) => {
  const options = deliveryOptions[deliveryType] || [];
  const option = options.find(opt => 
    totalWeight >= opt.minWeight && totalWeight < opt.maxWeight
  );
  
  return option?.description || (deliveryType === 'express' ? '1-2 business days' : '5-8 business days');
};

/**
 * Get delivery price for a given weight
 * @param {number} totalWeight - Total weight in grams
 * @param {string} deliveryType - 'standard' or 'express'
 * @param {Array} deliveryOptions - Formatted delivery options
 * @returns {number} - Delivery price
 */
export const getDeliveryPrice = (totalWeight, deliveryType, deliveryOptions) => {
  const options = deliveryOptions[deliveryType] || [];
  const option = options.find(opt => 
    totalWeight >= opt.minWeight && totalWeight < opt.maxWeight
  );
  
  if (option) return option.price;
  
  // If weight exceeds all ranges, use the highest tier
  if (options.length > 0) {
    const maxOption = options.reduce((prev, current) => 
      (prev.maxWeight > current.maxWeight) ? prev : current
    );
    return maxOption.price;
  }
  
  return 0;
};