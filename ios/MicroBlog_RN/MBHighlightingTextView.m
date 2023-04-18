//
//  MBHighlightingTextView.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//

#import "MBHighlightingTextView.h"

@implementation MBHighlightingTextView

- (id) init
{
  self = [super init];
  if (self) {
  }

  return self;
}

- (void) didSetProps: (NSArray<NSString *> *)changedProps
{
  NSLog(@"didSetProps %@", changedProps);
}

@end
