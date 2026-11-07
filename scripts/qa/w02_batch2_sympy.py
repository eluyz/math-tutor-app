"""Independent CAS audit of the authored parameter records exported by Vitest.
Run after src/university/w02Batch2.test.ts; no production solver is imported.
"""
import json
import sys
import sympy as s
from pathlib import Path
records=json.loads(Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/w02-batch2-symbolic-input.json').read_text())
x,y,u,v=s.symbols('x y u v',real=True)
q=lambda text:s.Rational(text.replace('−','-'))
counts={'quadratic':0,'bilinear':0,'minimum':0,'maximum':0,'saddle':0}
for row in records:
 a,b,c,d=map(lambda key:q(row[key]),['a','b','c','d'])
 F=a*x*y+b*x+c*y+d if row['kind']=='bilinear' else a*x*x+b*x*y+c*y*y+d*x+q(row['e'])*y+q(row['offset'])
 gradient=[s.diff(F,x),s.diff(F,y)]
 solutions=s.solve(gradient,(x,y),dict=True)
 assert len(solutions)==1
 expected={x:q(row['x']),y:q(row['y'])};assert solutions[0]==expected
 H=s.hessian(F,(x,y));det=s.factor(H.det())
 assert det==q(row['D']) and s.simplify(F.subs(expected))==q(row['value'])
 classification='saddle' if det<0 else 'minimum' if H[0,0]>0 else 'maximum'
 if row['kind']=='bilinear':
  assert det==-a*a<0 and classification=='saddle'
  assert s.expand(F.subs({x:expected[x]+u,y:expected[y]+v})-F.subs(expected)-a*u*v)==0
 counts[row['kind']]+=1;counts[classification]+=1
assert counts['bilinear']==24 and counts['quadratic']==96 and counts['minimum']==60
print(json.dumps({'status':'PASS','sympy':s.__version__,'records':len(records),'counts':counts},indent=2))
