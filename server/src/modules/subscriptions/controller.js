import Subscription from '../../models/Subscription.js';
import Plan from '../../models/Plan.js';
import Organization from '../../models/Organization.js';
import AuditLog from '../../models/AuditLog.js';

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get organization subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details
 */
export const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      orgId: req.user.orgId._id 
    }).populate('planId');

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    res.json({
      subscription,
      plan: subscription.planId,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
};

/**
 * @swagger
 * /api/subscriptions/plans:
 *   get:
 *     summary: Get available subscription plans
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: List of available plans
 */
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({
      isPublished: true,
      isActive: true,
    }).sort({ sortOrder: 1 });

    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
};

/**
 * @swagger
 * /api/subscriptions/limits:
 *   get:
 *     summary: Check subscription limits
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Action to check (create_workflow, activate_workflow, execute_workflow)
 *     responses:
 *       200:
 *         description: Limit check result
 */
export const checkLimits = async (req, res) => {
  try {
    const { action } = req.query;

    const subscription = await Subscription.findOne({ 
      orgId: req.user.orgId._id 
    }).populate('planId');

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const canPerform = await subscription.canPerformAction(action);
    const plan = subscription.planId;

    res.json({
      canPerform,
      usage: subscription.usage,
      limits: plan.limits,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Check limits error:', error);
    res.status(500).json({ error: 'Failed to check limits' });
  }
};

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Create new subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - billingCycle
 *             properties:
 *               planId:
 *                 type: string
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *               stripePaymentMethodId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription created successfully
 */
export const createSubscription = async (req, res) => {
  try {
    const { planId, billingCycle, stripePaymentMethodId } = req.body;

    if (!planId || !billingCycle) {
      return res.status(400).json({ error: 'Plan ID and billing cycle are required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive || !plan.isPublished) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const existingSubscription = await Subscription.findOne({
      orgId: req.user.orgId._id,
      status: { $in: ['active', 'trial'] },
    });

    if (existingSubscription) {
      return res.status(400).json({ error: 'Organization already has an active subscription' });
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + (plan.trialDays || 14));

    const subscription = new Subscription({
      orgId: req.user.orgId._id,
      planId,
      billingCycle,
      status: 'trial',
      trialStart: new Date(),
      trialEnd,
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
    });

    await subscription.save();

    await AuditLog.create({
      orgId: req.user.orgId._id,
      userId: req.user._id,
      action: 'create',
      resource: 'subscription',
      resourceId: subscription._id,
      details: { planId, billingCycle },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await Organization.findByIdAndUpdate(req.user.orgId._id, {
      subscriptionStatus: 'trial',
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: await subscription.populate('planId'),
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

/**
 * @swagger
 * /api/subscriptions:
 *   put:
 *     summary: Update subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 */
export const updateSubscription = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;

    const subscription = await Subscription.findOne({ 
      orgId: req.user.orgId._id 
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    if (planId) {
      const plan = await Plan.findById(planId);
      if (!plan || !plan.isActive || !plan.isPublished) {
        return res.status(400).json({ error: 'Invalid plan' });
      }
      subscription.planId = planId;
    }

    if (billingCycle) {
      subscription.billingCycle = billingCycle;
    }

    await subscription.save();

    await AuditLog.create({
      orgId: req.user.orgId._id,
      userId: req.user._id,
      action: 'update',
      resource: 'subscription',
      resourceId: subscription._id,
      details: { planId, billingCycle },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      message: 'Subscription updated successfully',
      subscription: await subscription.populate('planId'),
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

/**
 * @swagger
 * /api/subscriptions:
 *   delete:
 *     summary: Cancel subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: immediate
 *         schema:
 *           type: boolean
 *         description: Cancel immediately or at period end
 *     responses:
 *       200:
 *         description: Subscription canceled successfully
 */
export const cancelSubscription = async (req, res) => {
  try {
    const { immediate } = req.query;
    const cancelNow = immediate === 'true';

    const subscription = await Subscription.findOne({ 
      orgId: req.user.orgId._id 
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    if (cancelNow) {
      subscription.status = 'canceled';
      subscription.canceledAt = new Date();
      
      await Organization.findByIdAndUpdate(req.user.orgId._id, {
        subscriptionStatus: 'canceled',
      });
    } else {
      subscription.cancelAtPeriodEnd = true;
    }

    await subscription.save();

    await AuditLog.create({
      orgId: req.user.orgId._id,
      userId: req.user._id,
      action: 'cancel',
      resource: 'subscription',
      resourceId: subscription._id,
      details: { immediate: cancelNow },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      message: cancelNow ? 'Subscription canceled immediately' : 'Subscription will cancel at period end',
      subscription,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};
