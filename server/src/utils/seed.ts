import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { Provider } from '../models/Provider';
import { Service } from '../models/Service';
(async () => {
  await mongoose.connect(env.mongo); const hash = await bcrypt.hash('Demo1234', 12);
  const mk = async (name: string, email: string, role: string) => (await User.findOne({ email })) || User.create({ name, email, role, passwordHash: hash });
  await mk('Admin', 'admin@localloop.dev', 'admin'); await mk('Demo Customer', 'customer@localloop.dev', 'customer');
  const demo = [['Sharma Electricals', 'Electrician', 'Wiring & fan repair', 400], ['CoolAir Services', 'AC Repair', 'AC service', 500], ['Sparkle Home Care', 'Home Cleaning', 'Deep cleaning', 900]] as const;
  for (const [i, [biz, cat, svc, price]] of demo.entries()) {
    const u = await mk(biz, `provider${i + 1}@localloop.dev`, 'provider');
    if (await Provider.findOne({ user: u._id })) continue;
    const p = await Provider.create({ user: u._id, businessName: biz, category: cat, verified: true, address: 'Civil Lines, Moradabad', location: { type: 'Point', coordinates: [78.7733 + i * 0.01, 28.8386 + i * 0.008] } });
    await Service.create({ provider: p._id, name: svc, category: cat, price, duration: 60 });
  }
  console.log('Seeded. Demo password: Demo1234'); process.exit(0);
})();
