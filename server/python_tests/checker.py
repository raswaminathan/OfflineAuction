passed = 0
failed = 0
desc = ''

def check(expression):
  global failed, passed, desc
  if not expression:
    print 'FAILED: ' + desc
    failed += 1
  else:
    passed += 1

def finish(test_name):
  global failed, passed
  print ''
  print test_name + ':'
  print str(failed) + ' tests failed'
  print str(passed) + ' tests passed'
  print ''
  passed = 0
  failed = 0
